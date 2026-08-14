# Copy-Paste Remediation Plan — Wix-safe scope

> Follow strict TDD: write policy tests, verify RED, push for review, then implement after approval.

**Related issue:** #63

## User constraint

This remediation does not change Wix-provided or Wix-integration production code. The implementation is limited to test files, test fixtures/helpers, a narrowly scoped copy-paste detector configuration, and supporting documentation.

Protected production paths include:

- `src/hooks/useWixCart.js`
- `src/hooks/useWixContent.js`
- `src/hooks/useWixProducts.js`
- `src/services/wixCartService.js`
- `src/services/wixContentService.js`
- `src/services/wixCheckoutService.js`
- `src/services/wixService.js`
- `src/services/wixSession.js`
- all other non-test files under `src/`

Page rendering logic under `src/pages/` is also out of scope.

## Evidence and classification

MegaLinter's `COPYPASTE_JSCPD` check reports 52 clones at 6.1% duplication with a configured threshold of 0%. The findings include generated/upstream-managed Speckit scripts, repeated Wix hook test setup/fixtures, and additional application/CSS clones.

The `.specify/extensions/git/scripts/` files are treated as generated or upstream-managed Speckit assets and were not modified. The detector now has one narrow ignore pattern for that directory.

## Implementation slices completed

### Slice 1 — generated Speckit policy

Added `.jscpd.json` with only `**/.specify/extensions/git/scripts/**` in `ignore`. The threshold remains `0`; no global detector disablement or threshold relaxation was introduced.

### Slice 2 — test-only Wix fixture extraction

Extended the existing test-only `src/test-utils/copyPasteHelpers.js` module with Wix cart/content fixtures. Updated only these tests to consume shared fixtures:

- `src/hooks/useWixCart.test.js`
- `src/hooks/useWixContent.test.js`
- `src/hooks/useWixProducts.test.js`

No Wix hook, service, SDK integration, API handler, page, or other production source file was changed.

### Slice 3 — verification

The focused policy tests, full Vitest suite, production build, and fresh MegaLinter copy-paste report are required before closing this work. Any remaining clones must be classified rather than hidden.

## Acceptance criteria

- [x] No Wix integration or other production source file is changed.
- [x] Speckit generated-script duplication is covered by one narrow ignore pattern only.
- [x] No global copy-paste disablement or threshold relaxation is introduced.
- [x] Wix test fixture extraction preserves existing assertions and behavior.
- [x] Focused policy tests were RED before implementation and GREEN afterward.
- [x] Full Vitest suite and build pass on the implementation commit.
- [x] A fresh copy-paste report documents 38 remaining clones; generated Speckit script clones are excluded.

## Verification commands

```bash
node --test scripts/tests/copy-paste-wix-safe.policy.mjs
npm ci
npm test -- --run
npm run build
npx --yes jscpd@5.0.14 --reporters console --output /tmp/jscpd-report/ -c .jscpd.json .
```
