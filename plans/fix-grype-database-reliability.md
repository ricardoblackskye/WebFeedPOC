# Grype Database Reliability Plan

> **For Hermes:** Follow strict TDD: write policy tests, verify RED, push for review, then implement after approval.

**Goal:** Make the Grype MegaLinter check resilient to vulnerability database bootstrap failures without hiding vulnerability results.

**Architecture:** Add a narrowly scoped repository configuration for Grype database behavior only if supported by MegaLinter v10; otherwise document the runner limitation and keep the scanner strict.

**Technical Strategy:** Policy tests require Grype to remain enabled and require an explicit database/cache or failure-handling configuration, not a blanket disable. The implementation must not suppress scanner errors or findings.

**Testing Blueprint:** Node policy tests inspect `.mega-linter.yml` for the repository Grype configuration and reject disabling or error suppression.

## Tasks

1. Create `scripts/tests/grype-config.policy.mjs`; run RED.
2. Commit/push RED tests for review.
3. Add supported Grype configuration or a documented narrow workaround.
4. Run policy tests and existing application verification.
5. Push implementation and inspect the GitHub Actions result.

## Acceptance criteria

- Grype remains enabled and blocking.
- No `DISABLE_LINTERS: REPOSITORY_GRYPE` or `REPOSITORY_GRYPE_DISABLE_ERRORS` workaround is added.
- Database bootstrap succeeds, or a reproducible platform limitation is documented for follow-up.

Related issue: #51.

## Execution handoff

Stop after RED tests are pushed and obtain approval before implementation.

---

## History review

The previous Grype failure was a GitHub runner disk exhaustion during database activation. This branch must avoid treating a database infrastructure error as a clean security result.