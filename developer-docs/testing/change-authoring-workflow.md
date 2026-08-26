---
type: Reference
title: Change authoring workflow
description: Verified product change loop for firebaseui-web.
tags: [testing, validation, workflow]
---

# Change authoring workflow

How to author and verify a product change in this repo. Term ids: [iteration vocabulary](iteration-vocabulary.md). Exact commands: [change-authoring-verification.md](../playbooks/change-authoring-verification.md). Test layers: [testing-strategy.md](../architecture/testing-strategy.md). Do not duplicate command lines here.

## Primary loop

```text
gap-analysis (if needed)
        |
implementation  (tier: unit-focused)
        |
independent-review  (tier: area-focused, frozen tree)
        |
documentation (if user-facing or OKF changed)
        |
commit
        |
pre-merge-validation (tier: full) when the branch is ready to merge
```

## Work types

| Work type | When | Validation tier | Product edits | Commit |
|-----------|------|-----------------|---------------|--------|
| `gap-analysis` | Unclear feasibility | none | read-only | no |
| `baseline-capture` | Need a before snapshot | `area-focused` | no | no |
| `implementation` | Author fix/feature + tests | `unit-focused` | yes | no |
| `independent-review` | Verify frozen diff | `area-focused` | no, [frozen tree](#frozen-tree) | no |
| `documentation` | User docs + durable OKF | none | docs only | no |
| `commit` | Gates closed | none | staging only | yes |
| `pre-merge-validation` | Branch merge gate | `full` | no | no |

## Validation tiers

This repo's mapping. Command owner: [change-authoring-verification.md](../playbooks/change-authoring-verification.md).

| Tier | When | What |
|------|------|------|
| `unit-focused` | `implementation` | `pnpm build:packages`, the targeted example spec (`pnpm test:e2e:<example>`) when e2e/examples changed, `pnpm lint:check` on the diff. Package-only: `pnpm test` for touched packages. |
| `area-focused` | `independent-review` (frozen) | Full smoke for the changed example(s) on a frozen tree, plus `pnpm test` / lint / format as applicable |
| `full` | `pre-merge-validation` | The playbook sequence: `pnpm build`, `pnpm test`, lint/format, `pnpm test:e2e` |

`test.only` / focused Playwright files are OK during `unit-focused` only. Never commit them.

## Gates

| Gate | Closes when |
|------|-------------|
| `implementation` | `unit-focused` green with [validation evidence](#validation-evidence-blocking) |
| `review` | `area-focused` green on a [frozen tree](#frozen-tree); every review finding resolved |
| `commit` | Durable commit exists after prior gates closed with evidence |

**Trust rule:** Code on disk or in git with `review_gate` still **open** is unverified until `independent-review` closes the gate.

`independent-review` classifies findings **critical / serious / minor / nit**. The review gate closes only when every finding is fixed, unless the user confirms an acceptable exception (intractable limitation with evidence, or an explicit deferral with rationale). "Green with minors" is not green.

<a id="validation-evidence-blocking"></a>

### Validation evidence (blocking)

Gates close only when recorded evidence shows the required tier ran and passed. Summaries without exit codes do not close a gate.

| Gate | Minimum evidence |
|------|------------------|
| **`implementation`** | Canonical pnpm command(s) + exit 0 |
| **`review`** | Frozen-tree re-run of `area-focused` commands, exit 0 |
| **`commit`** | Prior gates closed with evidence; no `test.only` staged |
| **Publication** | `review_gate` closed on the exact commits being published |

On deps, CI, or e2e/example changes, also complete [change-authoring-verification.md](../playbooks/change-authoring-verification.md) before commit/push ([AD-10](../decisions.md#ad-10-change-authoring-requires-ci-parity-verification-before-commit)).

History rewrite (rebase, amend) invalidates prior green. Re-run the required tier.

## Frozen tree

Required for `independent-review`:

- No edits to `packages/**`, `examples/**`, or `e2e/**` during the run (except reverting accidental `test.only`).
- Wait for or cancel in-flight Playwright / pnpm test before editing again.

Keep `implementation` and `independent-review` in separate passes.

## Host rule

Do not overlap `unit-focused` and `area-focused` Playwright on the same host. Serial e2e already uses `workers: 1` and a shared Auth emulator on `:9099` ([AD-4](../decisions.md#ad-4-playwright-managed-dev-servers-serial-shared-emulator)).
