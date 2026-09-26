#!/bin/sh
# Behavioral tests: does a scaffolded harness deliver what the README claims, when a REAL
# agent session runs in it? Each test scaffolds a hub, asks `claude -p` a question with a
# checkable answer, and greps the reply. Costs API tokens and ~2-4 minutes — run by hand
# before a release, not in CI. Requires the `claude` CLI on PATH and a logged-in account.
#
#   sh test/behavioral.sh            # all four
#   MODEL=haiku sh test/behavioral.sh
#
# The four claims (README "The model in three ideas" + "The problem it solves"):
#   T1 routing      — a requirement lands on the right project via the registry, and the
#                     session finds the prior lesson + board state before acting
#   T2 cold resume  — a brand-new session recovers a parked item (file:line, SHA, next step,
#                     blocker) from the task board alone
#   T3 scale        — adding 30 projects adds one routing-index line each and nothing else;
#                     routing still lands on the right project reading only the registry
#   T4 learn loop   — the learn skill files a cross-project lesson into knowledge/, leaves the
#                     always-loaded core untouched, and check stays green
set -eu
MODEL="${MODEL:-sonnet}"
HERE=$(cd "$(dirname "$0")/.." && pwd)
BIN="node $HERE/bin/superharness.js"
TMP=$(mktemp -d)
trap 'rm -rf "$TMP"' EXIT
pass=0; fail=0
ask() { timeout 240 claude -p "$1" --model "$MODEL" --output-format text 2>&1; }
expect() { # expect <label> <haystack> <needle-regex>...
  label=$1; hay=$2; shift 2; ok=1
  for re in "$@"; do printf '%s' "$hay" | grep -qiE -- "$re" || { echo "  MISSING /$re/"; ok=0; }; done
  if [ $ok = 1 ]; then pass=$((pass+1)); echo "  ok  $label"; else fail=$((fail+1)); echo "  FAIL $label"; printf '%s\n' "$hay" | sed 's/^/      | /'; fi
}

$BIN init "$TMP/hub" --with-examples >/dev/null
cd "$TMP/hub"

echo "T1 routing"
out=$(ask "A user reports: 'after I imported my notes from a CSV, the search box doesn't find the new notes, but they show up in the list.' Do NOT fix anything and do not edit files. Answer in 4 lines: (1) which project owns this and what decided it; (2) the first file you read after deciding; (3) is there already a known rule or lesson about this exact failure — cite the file; (4) does the task board say anything relevant — cite the section.")
expect "routes to acme-notes via the registry, finds the lesson and the board" "$out" \
  'acme-notes' 'portfolio-registry' 'rebuild-index-after-bulk-import' 'docs/tasks/acme-notes|task board|Recently shipped|d41f0a2'

echo "T2 cold resume"
out=$(ask "This is a brand-new session; you have no memory of prior conversations. Resume work on the acme-notes share-link feature. Do NOT edit anything. Answer in 3 lines: (1) the exact next step, quoting the code change; (2) the file:line and commit it resumes from; (3) what decision it is blocked on and what default was chosen.")
expect "recovers the parked item from the board" "$out" \
  'WHERE NOT EXISTS|revoked_tokens' 'share\.js:74' 'a3f9c1e' '404'

echo "T3 scale"
before=$(sh scripts/harness-prime.sh | wc -c | tr -d ' ')
i=1; while [ $i -le 30 ]; do $BIN add-project "proj-$i" personal svc >/dev/null; i=$((i+1)); done
after=$(sh scripts/harness-prime.sh | wc -c | tr -d ' ')
per=$(( (after - before) / 30 ))
echo "  always-loaded: $before -> $after bytes (+$per bytes/project)"
[ "$per" -lt 160 ] && { pass=$((pass+1)); echo "  ok  one index line per project"; } || { fail=$((fail+1)); echo "  FAIL more than one line per project"; }
$BIN check >/dev/null && { pass=$((pass+1)); echo "  ok  check green at 33 projects"; } || { fail=$((fail+1)); echo "  FAIL check red"; }
out=$(ask "A user reports: 'after I imported my notes from a CSV, the search box doesn't find the new notes.' Do NOT edit anything. Answer in 2 lines: (1) which project owns this and how many projects are in the registry; (2) list every file you actually read to answer, in order.")
expect "still routes correctly among 33 projects" "$out" 'acme-notes' '33'

echo "T4 learn loop"
cd "$TMP" && $BIN init hub2 --with-examples >/dev/null && cd hub2
before=$($BIN check | grep total | awk '{print $1}')
out=$(timeout 300 claude -p "Use the /learn skill to capture this lesson, then stop. Lesson: while working on acme-web I discovered that our Node ORM silently drops the connection pool's max setting when DATABASE_URL contains a query string, so every deploy that sets ?sslmode=require runs with pool size 1 and the reports page times out under load. This is a durable technical fact any agent on any project using that ORM should be able to find. After writing, reply in 2 lines: (1) the path(s) you wrote to; (2) which files you deliberately did NOT touch." --model "$MODEL" --output-format text --allowedTools Read Glob Grep Edit Write Skill 2>&1)
changed=$(git status --short | awk '{print $2}' | tr '\n' ' ')
echo "  files changed: $changed"
expect "lesson lands in knowledge/, not the core" "$out" 'knowledge/(tech-discoveries|patterns|insights)'
printf '%s' "$changed" | grep -qE 'MEMORY\.md|PHILOSOPHY|disciplines/README|CLAUDE\.md' && { fail=$((fail+1)); echo "  FAIL always-loaded file edited"; } || { pass=$((pass+1)); echo "  ok  always-loaded core untouched"; }
$BIN check >/dev/null && { pass=$((pass+1)); echo "  ok  check green after learn (tax $before -> $($BIN check | grep total | awk '{print $1}'))"; } || { fail=$((fail+1)); echo "  FAIL check red after learn"; $BIN check | tail -5; }

echo; echo "$pass passed, $fail failed"
[ $fail = 0 ]
