# TS-TestInfra: Convert Test Infrastructure Files to TypeScript

**Issue:** [#125](https://github.com/ricardoblackskye/WebFeedPOC/issues/125)
**Branch:** `ts/125-test-infra-migration`

## Scope

Convert test infrastructure files from JavaScript to TypeScript, plus add a new test file for `copyPasteHelpers`.

### Files to convert

| Current | Target | Type of change |
|---------|--------|----------------|
| `src/test-setup.js` | `src/test-setup.ts` | Convert + add type annotations |
| `src/test-utils/copyPasteHelpers.js` | `src/test-utils/copyPasteHelpers.ts` | Convert + add interfaces |
| — (new) | `src/test-utils/copyPasteHelpers.test.ts` | **NEW** — test fixture factories |
| `vite.config.ts` | — | Update `setupFiles` + `coverage.exclude` paths |

### Files to delete after conversion
- `src/test-setup.js`
- `src/test-utils/copyPasteHelpers.js`

### Other files that need updates
- `vite.config.ts` — `setupFiles: './src/test-setup.js'` → `'./src/test-setup.ts'`, `coverage.exclude` path update
- `scripts/tests/js-standard-core.policy.mjs` — `'src/test-setup.js'` → `'src/test-setup.ts'`

## Requirements

### 1. `src/test-setup.ts`
- Add type annotations for the `IntersectionObserver` mock class
- Keep `expect.extend`, `afterEach(cleanup)`, `matchMedia` mock, and `IntersectionObserver` mock

### 2. `src/test-utils/copyPasteHelpers.ts`
- Define TypeScript interfaces for fixture data shapes:
  - `ProductFixture` — id, name, price
  - `CartFixture` — id, lineItems
  - `WixCartLineItemFixture` — _id, catalogReference, productName, price, quantity
  - `WixCartFixture` — lineItems
  - `ContentFixture` — _id, title, body
- Use generic types with `Partial<>` for the overrides parameter
- Export all fixture functions with proper return types

### 3. `src/test-utils/copyPasteHelpers.test.ts` (NEW)
- Tests for each fixture factory function:
  - Default values for each fixture type
  - Override merging works correctly
  - Override can override default values
  - Multiple overrides merge correctly

### 4. Config updates
- `vite.config.ts`:
  - `setupFiles: './src/test-setup.ts'`
  - `coverage.exclude`: `'src/test-setup.ts'`
- `scripts/tests/js-standard-core.policy.mjs`:
  - `'src/test-setup.ts'` (file that's excluded from JS Standard linting)

## Execution (TDD)

1. **Phase 1.5** — MegaLinter pre-flight ✅ (main baseline green)
2. **Phase 2** — Write `copyPasteHelpers.test.ts`, verify RED (tests can't import from `.ts` that doesn't exist)
3. **Phase 3** — Stop for user approval
4. **Phase 4** — Implement: convert `.js`→`.ts`, update configs, make GREEN
5. **Phase 4.5** — MegaLinter post-verification

## Verification

```bash
npx tsc --noEmit           # must pass
npx vitest run              # all 24+ test files green
npm run build               # production build must pass
npx cspell "src/test-setup.ts" "src/test-utils/*.ts"   # no spelling issues
```