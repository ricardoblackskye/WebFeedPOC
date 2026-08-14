# Copy-Paste Remediation Plan — Wix-safe scope

> Follow strict TDD: write policy tests, verify RED, push for review, then implement after approval.

**Related issue:** #63

## User constraint

This remediation must not change Wix-provided or Wix-integration production code. The first implementation slice is limited to:

- test files and test fixtures/helpers;
- a narrowly scoped copy-paste detector configuration;
- this plan and supporting triage documentation.

The following production paths are protected and must not be edited in this issue:

- `src/hooks/useWixCart.js`
- `src/hooks/useWixContent.js`
- `src/hooks/useWixProducts.js`
- `src/services/wixCartService.js`
- `src/services/wixContentService.js`
- `src/services/wixCheckoutService.js`
- `src/services/wixService.js`
- `src/services/wixSession.js`
- all other non-test files under `src/`

Page rendering refactors (`src/pages/`) are also explicitly out of scope. If a future product-code refactor is desirable, it must be a separate issue and receive separate approval.

## Evidence and classification

MegaLinter's copy-paste detector reports 52 clones at 6.1% duplication with a configured threshold of 0%. The findings include:

1. `.specify/extensions/git/scripts/bash/auto-commit.sh` ↔ `initialize-repo.sh`;
2. `.specify/extensions/git/scripts/powershell/auto-commit.ps1` ↔ `create-new-feature.ps1`;
3. repeated setup and fixtures in the Wix hook tests;
4. additional application/CSS clones.

The `.specify/extensions/git/scripts/` files are treated as generated or upstream-managed Speckit assets. They must not be manually refactored. A narrow detector exclusion may be added only for that generated directory; no broad source or JSON exclusion is acceptable.

## TDD implementation slices

### Slice 1 — generated Speckit policy

- Add a `.jscpd.json` configuration that ignores only `**/.specify/extensions/git/scripts/**`.
- Keep the 0% threshold and all other detector behavior unchanged.
- Add a policy test rejecting broad ignores, threshold increases, and global detector disablement.

### Slice 2 — test-only Wix fixture extraction

- Extract repeated fixtures/setup from the Wix hook tests into the existing test-helper area.
- Update only test files and test helpers; preserve every assertion and test scenario.
- Start with `useWixCart.test.js`, then assess `useWixContent.test.js` and `useWixProducts.test.js` independently.
- Do not alter the implementation hooks, services, SDK calls, API handlers, or pages.

### Slice 3 — verification and remaining clones

- Run focused policy tests after each slice.
- Run the full Vitest suite and production build.
- Re-run `COPYPASTE_JSCPD` and classify the remaining clones.
- Do not claim the issue resolved until the remaining clone report distinguishes excluded generated assets from actionable test duplication.

## Acceptance criteria

- [ ] No Wix integration or other production source file is changed.
- [ ] Speckit generated-script duplication is covered by one narrow ignore pattern only.
- [ ] No global copy-paste disablement or threshold relaxation is introduced.
- [ ] Wix test fixture extraction preserves existing assertions and behavior.
- [ ] Focused policy tests were RED before implementation and GREEN afterward.
- [ ] Full Vitest suite and build pass.
- [ ] A fresh copy-paste report documents the remaining clones.

## RED-phase handoff

The RED PR contains only this plan and policy tests. It must be reviewed before adding `.jscpd.json` or changing any test files.
