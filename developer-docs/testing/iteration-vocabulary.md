---
type: Reference
title: Iteration vocabulary
description: Identifier glossary and work-queue field schema. Not workflow rules or commands.
tags: [testing, validation, workflow, work-queue]
---

# Iteration vocabulary

Glossary of **string identifiers** used across this bundle. This doc does not define procedures or pnpm commands.

**Policy:** [documentation policy](../documentation-policy.md).

| Topic | Owner |
|-------|--------|
| Change loop, gates, frozen tree | [change authoring workflow](change-authoring-workflow.md) |
| Canonical verification commands | [change-authoring-verification.md](../playbooks/change-authoring-verification.md) |
| Test layers | [testing-strategy.md](../architecture/testing-strategy.md) |

## Work type identifiers

| Work type | Brief meaning |
|-----------|---------------|
| `gap-analysis` | Read-only feasibility check |
| `baseline-capture` | Record a before snapshot (rarely needed) |
| `implementation` | Author product code and tests |
| `independent-review` | Verify a frozen diff |
| `documentation` | User docs and durable OKF updates |
| `commit` | Stage and create one commit |
| `pre-merge-validation` | Branch-wide merge gate |

## Validation tier identifiers

| Tier id | Brief meaning |
|---------|---------------|
| `unit-focused` | Fast validation while product code is changing |
| `area-focused` | Changed example(s) plus package tests / lint on a frozen tree |
| `full` | CI-equivalent: build, unit, lint/format, all Playwright smoke |

Commands per tier: [change authoring](change-authoring-workflow.md#validation-tiers). There is no Jest / Detox / `:test-cover` stack here.

## Gate identifiers

Work queues use these **field names** (values: `open` | `closed`):

| Field | Tracks |
|-------|--------|
| `implementation_gate` | `implementation` work type complete |
| `review_gate` | `independent-review` work type complete |
| `commit_gate` | Durable commit exists after prior gates closed with evidence |

Items may also be marked **`blocked`**.

## Work-queue fields

| Field | Allowed values / meaning |
|-------|--------------------------|
| `next_work_type` | A work type identifier above |
| `validation_tier` | `unit-focused` \| `area-focused` \| `full` |
| `platform` | Optional; this repo is web. Use an example id if needed (`react`, `angular-example`, …) |
| `implementation_gate` | `open` \| `closed` |
| `review_gate` | `open` \| `closed` |
| `commit_gate` | `open` \| `closed` |
| `commit_subject` | Planned Conventional Commits first line. Set before `git commit`. Do not record SHAs. |
| `blocked` | Item or dependency blocked |

Queues record **state**, not who executes the work.
