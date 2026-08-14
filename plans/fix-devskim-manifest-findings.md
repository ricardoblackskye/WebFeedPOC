# DevSkim Manifest Findings Plan

> Follow strict TDD: write policy tests, verify RED, push for review, then implement after approval.

**Related issue:** #50

## Goal

Classify and narrowly suppress DevSkim false positives for Speckit integrity hashes without hiding real secrets or weakening DevSkim coverage elsewhere.

## Evidence

MegaLinter run [31720693378](https://github.com/ricardoblackskye/WebFeedPOC/actions/runs/31720693378) reports 29 `DS173237` findings in:

- `.specify/integrations/speckit.manifest.json`
- `.specify/integrations/copilot.manifest.json`

The flagged values are 64-character hexadecimal values used as manifest integrity metadata. The current `.devskim.json` `suppressions` property does not affect DevSkim 1.0.70, as confirmed by the repeated CI findings.

## TDD strategy

1. Preserve and validate every manifest integrity value as a 64-character hexadecimal hash.
2. Require path exclusions to name exactly the two affected manifest files.
3. Reject global `DS173237` suppression through `IgnoreRuleIds` or `LanguageRuleIgnoreMap`.
4. Reject the currently ineffective unsupported `suppressions` structure.
5. Verify the policy tests fail against the current configuration.
6. Commit and push only the RED tests for review.
7. Stop for explicit approval before changing `.devskim.json` or implementing the remediation.

## Expected implementation direction after approval

Use a documented DevSkim 1.0.70 configuration property that excludes only the two manifest paths, without deleting or altering the hashes. Confirm the actual MegaLinter SARIF output, because a syntactically valid configuration is not sufficient evidence that the findings are suppressed.

## Acceptance criteria

- All flagged values are classified as integrity hashes or remediated as real secrets.
- No active secret remains in tracked source.
- The suppression is limited to the two manifest paths.
- `DS173237` remains active for all other files.
- The `REPOSITORY_DEVSKIM` check passes without unrelated findings being suppressed.
- Existing application tests and build remain green.

## Execution handoff

Stop after RED tests are committed and pushed. Obtain user approval before implementation.

## Verification after approval

```bash
node --test scripts/tests/devskim-manifest.policy.mjs
npm ci
npm test -- --run
npm run build
```

Then inspect the resulting MegaLinter DevSkim SARIF and separate any Trivy/Grype or jscpd failures from this issue.

### Test command

```bash
node --test scripts/tests/devskim-manifest.policy.mjs
```

### Files intentionally changed in RED phase

- `plans/fix-devskim-manifest-findings.md`
- `scripts/tests/devskim-manifest.policy.mjs`

No implementation/configuration change is authorized in the RED phase.
