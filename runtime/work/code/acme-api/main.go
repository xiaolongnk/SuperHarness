// acme-api (EXAMPLE) — illustrative stub only, not a working build.
// A real acme-api would be a Go service; this file exists to give the work-tier
// example project a source file to route commits against. See README.md.
package main

import "fmt"

func exportJobStatus(jobID string) string {
	return fmt.Sprintf("job %s: queued", jobID)
}

func main() {
	fmt.Println(exportJobStatus("demo-1"))
}
