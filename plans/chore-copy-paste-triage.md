# Copy-Paste Findings Triage Plan

> **For Hermes:** Follow strict TDD: write policy tests, verify RED, push for review, then implement after approval.

**Goal:** Reduce genuine application duplication from jscpd findings while documenting or excluding intentional Speckit/vendor duplication.

**Architecture:** Extract only clear shared application/test helpers and keep generated/vendor assets unchanged unless their source-of-truth policy is known. Use targeted jscpd configuration only for confirmed generated paths.

**Technical Strategy:** Begin with policy tests requiring a documented triage map and a shared test-helper module. Avoid broad duplication thresholds or global COPYPASTE disablement.

**Testing Blueprint:** Node policy tests validate the triage document and helper existence. Existing Vitest/build tests provide behavior regression coverage.

## Tasks

1. Create `scripts/tests/copy-paste-triage.policy.mjs`; run RED.
2. Commit/push RED tests for review.
3. Add triage documentation and extract one safe shared helper at a time.
4. Run focused and full tests/build.
5. Push implementation and inspect jscpd output.

## Acceptance criteria

- Generated/vendor Speckit duplication is explicitly classified.
- At least the clearest application/test duplication is addressed or justified.
- No broad jscpd disablement is introduced.
- Application tests and build remain green.

Related issue: #48.

## Execution handoff

Stop after RED tests are pushed and obtain approval before implementation.

---

## History review

The repository currently uses Vitest and existing tests for application behavior. Refactors should preserve these tests and avoid touching security-sensitive dependency changes already merged.
