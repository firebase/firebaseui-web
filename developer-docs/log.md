# developer-docs Update Log

## 2026-07-02

* **Update**: Revised AD-3/AD-4/AD-5 and added AD-6/AD-7/AD-8 in [decisions.md](decisions.md) after the Playwright e2e feasibility review (Playwright `webServer`/`globalSetup` orchestration; `custom-auth-server` on `:4001`; separate broadly-triggered e2e CI workflow; dev-server-only MVP with production-artifact validation deferred).
* **Update**: Rewrote [work-queues/playwright-e2e-smoke.md](work-queues/playwright-e2e-smoke.md) — renumbered phases (react vertical slice first), added an orchestrator-processable gate tracker using neutral OKF work-queue field conventions, and folded in all review findings.
* **Update**: Refreshed [architecture/examples-inventory.md](architecture/examples-inventory.md) (custom-auth-server in scope, forgot-password route divergence, optional auth flags), [architecture/testing-strategy.md](architecture/testing-strategy.md), and [playbooks/dependency-update-verification.md](playbooks/dependency-update-verification.md).

## 2026-07-01

* **Creation**: Initialized OKF bundle at `/developer-docs/` with policy, decisions log, architecture references, playbooks, and Playwright e2e work queue.
* **Update**: Recorded AD-1 through AD-5 in [decisions.md](decisions.md).
* **Update**: Added `.agents/reports/` to repository `.gitignore`.
