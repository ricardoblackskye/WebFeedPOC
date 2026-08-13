# DevSkim Manifest Findings Plan

> **For Hermes:** Follow strict TDD: write policy tests, verify RED, push for review, then implement after approval.

**Goal:** Classify and narrowly suppress DevSkim false positives for Speckit integrity hashes without hiding real secrets.

**Architecture:** Preserve manifest hash values and add a dedicated `.devskim.json` configuration scoped to the two known manifest files/rule, only after confirming these are integrity metadata.

**Technical Strategy:** Add tests that require manifest values to remain 64-character hashes and require a narrow DevSkim configuration/suppression. Never delete or rotate values unless investigation proves they are credentials.

**Testing Blueprint:** Node policy tests validate JSON structure, hash shape, and narrow configuration boundaries.

## Tasks

1. Create `scripts/tests/devskim-manifest.policy.mjs`; run RED.
2. Commit/push RED tests for review.
3. Verify manifest format and add narrow `.devskim.json` remediation.
4. Run policy tests, JSON validation, and application tests/build.
5. Push implementation and inspect DevSkim.

## Acceptance criteria

- All flagged values are classified as integrity hashes.
- No active secret remains in tracked source.
- Suppression is limited to the two manifest files and DS173237.
- DevSkim passes without unrelated suppression.

Related issue: #50.

## Execution handoff

Stop after RED tests are pushed and obtain approval before implementation.
