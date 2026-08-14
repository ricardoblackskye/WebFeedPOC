# DevSkim Manifest Findings Plan

> Follow strict TDD: write policy tests, verify RED, push for review, then implement after approval.

**Related issue:** #50

## Goal

Classify and narrowly suppress DevSkim false positives for Speckit integrity hashes without hiding real secrets or weakening DevSkim coverage elsewhere.

## Evidence

MegaLinter run [31720693378](https://github.com/ricardoblackskye/WebFeedPOC/actions/runs/31720693378) reported 29 `DS173237` findings in:

- `.specify/integrations/speckit.manifest.json`
- `.specify/integrations/copilot.manifest.json`

The flagged values are 64-character hexadecimal values used as manifest integrity metadata. The previous `.devskim.json` `suppressions` property did not affect DevSkim 1.0.70, as confirmed by repeated CI findings.

## TDD strategy

1. Preserve and validate every manifest integrity value as a 64-character hexadecimal hash.
2. Require a supported `Globs` exclusion matching only the affected manifest paths.
3. Reject global `DS173237` suppression through `IgnoreRuleIds` or `LanguageRuleIgnoreMap`.
4. Reject the ineffective legacy `suppressions` structure.
5. Verify the policy tests fail against the current configuration.
6. Commit and push only the RED tests for review.
7. After approval, implement the path-scoped configuration and verify fresh MegaLinter SARIF output.

## Implementation

DevSkim's documented `Globs` option now excludes `**/.specify/integrations/*.manifest.json`. This matches the two manifest files recursively while keeping `DS173237` active elsewhere. The integrity hashes were not changed.

## Acceptance criteria

- All flagged values are classified as integrity hashes or remediated as real secrets.
- No active secret remains in tracked source.
- The exclusion is limited to the two manifest paths.
- `DS173237` remains active for all other files.
- The `REPOSITORY_DEVSKIM` check reports no findings for these manifests.
- Existing application tests and build remain green.
- Unrelated jscpd and vulnerability-database failures remain separately tracked.

## Verification

```bash
node --test scripts/tests/devskim-manifest.policy.mjs
npm ci
npm test -- --run
npm run build
```

The authoritative scanner verification is the MegaLinter workflow on the implementation commit.
