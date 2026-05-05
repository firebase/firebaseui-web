# integration-helper eval

Local eval harness for `.agents/skills/integration-helper`.

The harness runs every eval case in three variants:

- `with_skill`: copies the integration-helper skill into an isolated scratch app.
- `without_skill`: runs the same task with no project skill in the scratch app.
- `docs_dump`: runs without the skill, but prepends the consumer docs to the prompt.

Each run records runner transcripts, timing, deterministic grades, optional LLM judge grades, per-run manifests, and an aggregate benchmark. Token and tool telemetry are captured when the selected runner exposes them.

## Supported runners

- `codex`: uses the Codex CLI and preserves the richer JSONL, token, and structured-output support the harness originally depended on.
- `cursor`: uses the Cursor TypeScript SDK in local mode. It captures duration, final response text, run status, and tool-call counts, but token usage is not currently available from the SDK.
- `cursor` also depends on the SDK's local native dependencies being built successfully on the machine running the eval.

Additional runners can be added under `runners/` without changing `evals.json`, fixtures, or grading logic.

## Usage

```sh
cd evals/integration-helper
node scripts/run.mjs --list
node scripts/run.mjs --case react-vite-email-password --skip-llm-judge
node scripts/run.mjs --runner cursor --case react-vite-email-password --skip-llm-judge
node scripts/run.mjs
```

Useful flags:

- `--runner <id>`: select the main execution runner. Currently `codex` or `cursor`.
- `--judge-runner <id|none>`: select a separate runner for the LLM judge. Defaults to the main runner.
- `--case <id>`: run one case. Repeat for multiple cases.
- `--variant <name>`: run one variant. Repeat for multiple variants.
- `--iteration <n>`: write to a specific iteration.
- `--skill-path <path>`: override the source skill directory.
- `--docs-mode <inline|none>`: include or suppress docs-bundle injection for `docs_dump`.
- `--cursor-model <id>`: override the Cursor model id. Defaults to `composer-2` or `CURSOR_MODEL`.
- `--cursor-api-key <key>`: override `CURSOR_API_KEY`.
- `--force`: overwrite an existing iteration directory.
- `--skip-llm-judge`: run deterministic grading only.
- `--dry-run`: print the planned run matrix without invoking a runner.

By default, scratch apps are created under the system temp directory in `firebaseui-web-integration-helper-eval/`. The runner copies the finished app, transcripts, timing, grading, and `manifest.json` back to `workspace/iteration-N/`, which is ignored by git.

## Platform notes

- `codex` supports schema-constrained judge output directly.
- `cursor` falls back to prompting for raw JSON and parsing it.
- The Cursor SDK local runner does not currently expose a Codex-style sandbox control, so requested sandbox modes are recorded in run metadata but not enforced by the SDK itself.
- If the Cursor SDK cannot load because of a local native dependency issue, the harness now fails with an explicit setup error instead of crashing the whole script at startup.
- Benchmark aggregation tolerates missing token metrics, so cross-runner comparisons still work even when one platform exposes fewer telemetry fields.
