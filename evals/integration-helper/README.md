# integration-helper eval

Local eval harness for `.agents/skills/integration-helper`.

The harness runs every eval case in three variants:

- `with_skill`: copies the integration-helper skill into an isolated scratch app.
- `without_skill`: runs the same task with no project skill in the scratch app.
- `docs_dump`: runs without the skill, but prepends the consumer docs to the prompt.

Each run records Codex JSONL, token usage, duration, deterministic grades, optional LLM judge grades, and an aggregate benchmark.

## Usage

```sh
cd evals/integration-helper
node scripts/run.mjs --list
node scripts/run.mjs --case react-vite-email-password --skip-llm-judge
node scripts/run.mjs
```

Useful flags:

- `--case <id>`: run one case. Repeat for multiple cases.
- `--variant <name>`: run one variant. Repeat for multiple variants.
- `--iteration <n>`: write to a specific iteration.
- `--force`: overwrite an existing iteration directory.
- `--skip-llm-judge`: run deterministic grading only.
- `--dry-run`: print the planned run matrix without invoking Codex.

Codex executes against isolated scratch apps under `/private/tmp/firebaseui-web-integration-helper-eval` by default. The runner copies the finished app and transcripts back to `workspace/iteration-N/`, which is ignored by git.
