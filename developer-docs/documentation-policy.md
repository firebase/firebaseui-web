---
type: Policy
title: Documentation policy
description: Rules for authoring and maintaining firebaseui-web documentation for humans and agents.
tags: [documentation, agents, okf]
timestamp: 2026-07-01T00:00:00Z
---

# Scope

Applies to all durable documentation in this repository: the [developer-docs](index.md) OKF bundle, root markdown guides, package READMEs, and inline doc comments when they carry architectural meaning.

**Read this document before editing any documentation.**

# Principles

* **Be concise.** Prefer short sentences, tables, and lists over long prose. If a fact fits in one line, do not use a paragraph.
* **Durable artifacts only.** Commits, code, and docs are long-lived. Do not store ephemeral work-queue state, session notes, or "current sprint" references in them unless the file lives under [work-queues/](work-queues/) and is explicitly treated as a living backlog.
* **Single owner per fact (document contract).** Each information item is owned by exactly one document (which may be outside this bundle). Other documents **refer** to that owner with a link; they do not duplicate the content. When the fact changes, update the owner only.

# OKF bundle conventions

* Bundle root: `developer-docs/` ([index.md](index.md)).
* Concept files: YAML frontmatter with required `type`; see [OKF v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md) (consult the spec only during documentation maintenance runs, not on every code change).
* Decisions: append to [decisions.md](decisions.md) as `AD-<number>` entries. ADR shape follows [mattpocock ADR format](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/ADR-FORMAT.md) (consult that spec only during documentation maintenance runs).
* Work queues: living backlogs under [work-queues/](work-queues/); may name phases and task IDs; not cited as normative architecture.

# Where to put new content

| Content | Owner document |
|---------|----------------|
| Architecture shape, inventories | `developer-docs/architecture/` |
| Hard-to-reverse decisions | `developer-docs/decisions.md` |
| Step-by-step procedures | `developer-docs/playbooks/` or root guides (pick one owner) |
| Implementation backlogs | `developer-docs/work-queues/` |
| Contributor onboarding | [CONTRIBUTING.md](../CONTRIBUTING.md) |
| Local dev commands | [LOCAL_DEVELOPMENT.md](../LOCAL_DEVELOPMENT.md) |
| Agent ephemeral output | `.agents/reports/` (gitignored) |

# Citations

[1] [Open Knowledge Format v0.1](https://github.com/GoogleCloudPlatform/knowledge-catalog/blob/main/okf/SPEC.md)
[2] [ADR format (mattpocock)](https://github.com/mattpocock/skills/blob/main/skills/engineering/domain-modeling/ADR-FORMAT.md)
