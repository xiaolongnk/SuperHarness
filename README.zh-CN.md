# SuperHarness

[English](README.md) | [简体中文](README.zh-CN.md)

![status: pre-release](https://img.shields.io/badge/status-pre--release-orange) ![license: MIT](https://img.shields.io/badge/license-MIT-blue) ![node: >=18](https://img.shields.io/badge/node-%3E%3D18-green)

**用 AI coding agent 同时管理多个项目的 harness——一个仓库就是控制台。**

一个控制点把每条需求路由到正确的项目，每个项目有一块跨会话存活的任务板，每次只加载任务
需要的上下文，并且能从自己的错误中学习——而 always-loaded 的 prompt 不会越长越大。
纯 markdown + 一个零依赖 CLI，没有守护进程。

```sh
npm create superharness my-hub      # 生成 harness 仓库
cd my-hub
npx create-superharness add-project notes personal   # 注册第一个项目
claude                              # 每次会话自动加载 PHILOSOPHY + disciplines
```

---

## 它解决什么问题

单个 agent 会话 + 单个仓库没问题。到第 4 个项目就撑不住了：

- **上下文归零。** 每个新会话都要重新推导：哪个项目管什么、什么在进行中、什么已经试过。
- **Prompt 膨胀。** 本能的修法是往 CLAUDE.md 里再贴一段。每一个教训都让 prompt 长一点，
  直到里面没有一条能可靠触发。
- **不会学习。** 周二纠正过的错误，周四再犯一遍。

SuperHarness 是同时解决这三件事的结构，从一个每天真实运行、管理着 40 个项目的 harness
里抽取出来。

## `init` 生成什么

```
my-hub/
├── CLAUDE.md                 # 30 行——一个会话如何找到其它一切
├── PHILOSOPHY.md             # 4 条推理原语（always loaded）
├── disciplines/              # 15 条常驻规则——索引常驻，正文按需加载
├── skills/                   # 13 个 skill：route、portfolio-triage、demand-pipeline、learn、curate…
├── docs/
│   ├── portfolio-registry.md # 路由表：项目 → tier → 职责 → 需求关键词
│   ├── tasks/<project>.md    # 每项目一块持久任务板（/clear 和 compaction 后仍在）
│   └── *.md                  # 模型本身：portfolio、architecture、memory、skills、delegation…
├── agents/<project>.md       # 每项目的 agent 定义：角色、边界、完成标准
├── memory/MEMORY.md          # 有上限的路由索引 → clusters/ 命中才加载
├── knowledge/                # 无上限的教训归档（incidents、patterns、insights…）
├── runtime/<tier>/code/<p>/  # 你真正的代码仓库放这里，不进本仓库历史
├── scripts/harness-prime.sh  # SessionStart hook：注入 always-loaded 核心
├── .claude/                  # settings.json（hook）+ skills/ → ../skills
└── harness.json              # always-loaded 税的基线
```

所有文件都归你——CLI 只是复制，不做封装。

## CLI

| 命令 | 作用 |
|---|---|
| `create-superharness [init] [dir] [--with-examples] [--no-git]` | 生成 harness（幂等——对已有仓库安全，从不覆盖）。 |
| `superharness add-project <name> <personal\|work> [type]` | 注册一个项目：runtime 目录 + registry 行 + agent 定义 + 任务板，四件一起生成。缺任何一件都会让下一条需求路由错，所以从不手工创建。 |
| `superharness check [--update-baseline]` | 两道门，任一失败 exit 1：**always-loaded 税**超过基线；或 registry / agents / boards / runtime 目录 / skill frontmatter 不一致。放进 CI 或 pre-commit。 |
| `superharness prime` | 打印 always-loaded 核心（即 SessionStart hook 注入的内容）。 |

## 三个核心想法

**1. 管的是项目组合，不是单个任务。** `docs/portfolio-registry.md` 是路由表。需求进来 →
`skills/route` 匹配到项目 → 该项目的 `agents/<p>.md` 说明这里怎么干活，`docs/tasks/<p>.md`
说明什么在进行中。**tier**（`personal` = 直接提交 main，`work` = 分支 + PR + review）是项目
的属性，永远不是每个任务临时判断。→ [`docs/portfolio.md`](docs/portfolio.md)

**2. 只守一个数字：always-loaded 税。** 每一层——disciplines、skills、memory、knowledge、
任务状态——都拆成"每次会话都加载的小索引"和"命中才加载的库"。库可以无限长，索引必须
持平或下降。`superharness check` 负责度量。新增第 30 个项目，对第 1 个项目的会话成本只有
路由索引里的一行（约 90 字节），别无其它——实测数据见 `test/behavioral.sh`。
→ [`docs/architecture.md`](docs/architecture.md)

**3. 一个把失败灌进库的环路。** 纠正 → `skills/learn` 把教训路由到正确的层 → `skills/curate`
把不再值得常驻的内容沉淀进 `knowledge/` → `check` 证明核心没有变大。修原因不修表象，
先减再加。→ [`disciplines/self-improvement-loop.md`](disciplines/self-improvement-loop.md)

一切的源头是 [`PHILOSOPHY.md`](PHILOSOPHY.md) 里的四条原语；完整论证见 [`ESSAY.md`](ESSAY.md)。

## 不用 CLI 也能采纳

全是 markdown。把 `PHILOSOPHY.md` 和 `disciplines/` 放进你 agent 的 system prompt，用
`templates/` 里的 registry / board / agent 定义模板，按 `docs/memory-system.md` 手工接上
memory。Claude Code、Codex、Cursor、Gemini CLI——任何能读 system prompt、能跟着 markdown
走的 agent 都适用。

`--with-examples` 会额外生成三个虚构项目（`acme-notes`、`acme-web`、`acme-api`），带各自的
agent 定义、任务板、knowledge pack 和 memory，外加 `docs/walkthrough-acme-notes.md`——把一个
项目从头到尾串起来，包括一个完整的事故处理示例：假设 → 证据 → 第一版修复通过了测试却没过
契约的反向测试 → 真正的修复。

## 范围

SuperHarness 是*管理层*：registry、disciplines、skills、memory、任务状态，以及保持它们
一致的 CLI。它不负责生成或监督 agent 进程——跑一个会话还是二十个，结构不变。多 agent
编排自带。

## 开发

```sh
npm test                 # 从打包的 tarball 生成 harness，逐个破坏不变量，证明 `check` 会变红
sh test/behavioral.sh    # 在生成的 harness 里跑真实的 `claude -p`，检验 README 的宣称是否成立（消耗 token）
```

Clean-room 约束：没有真实项目名、主机、凭证或私有知识——由 CI 里的 `.gitleaks.toml`
强制。见 [`CONTRIBUTING.md`](CONTRIBUTING.md)。

## 许可

代码、CLI、模板——**MIT**（`LICENSE`）。文档与 disciplines——**CC BY 4.0**（`LICENSE-DOCS.md`）。
