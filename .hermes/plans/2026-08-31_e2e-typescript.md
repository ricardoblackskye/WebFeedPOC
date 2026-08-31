# Plan: TS-E2E — Convert E2E test files to TypeScript (#128)

- **Issue:** https://github.com/ricardoblackskye/WebFeedPOC/issues/128
- **Epic:** #122 (JS → TypeScript Migration), Phase 2
- **Branch:** `feat/e2e-typescript-128`
- **Author:** Senior Software Engineer (AI SDLC flow)
- **Date:** 2026-08-31

## Goal
Convert the E2E Playwright test suite (`e2e/*.js`) to TypeScript so the suite is
type-checked under the repo's existing `tsconfig.json` (which already includes
`e2e/**/*` with `strict: true`). Add explicit Playwright `Page` types, delete the
old `.js` sources, and keep every test's runtime behaviour byte-for-byte identical.

## Root cause (verified)
The E2E suite is the last JS-only area of the migration. `src/**` and the unit-test
infrastructure were already converted in #124–#127; `e2e/**` is still JavaScript.
The conversion is **mechanical** (a 1:1 re-type), not behavioural: the issue states
"Keep all existing test logic unchanged — only add types." No app code changes.

### Verified environment facts
- Repo-wide convention is the **bare** import specifier `'playwright/test'`
  (confirmed in all 10 e2e `*.js` files + `fixtures.js`). Issue #128 explicitly
  requires preserving this — do **not** switch to `@playwright/test`.
- `tsconfig.json` already has `"include": ["src/**/*","tests/**/*","e2e/**/*",...]`
  with `"strict": true`, `"allowJs": true`, `"skipLibCheck": true`. `noImplicitAny`
  is therefore on (strict), so all `page` params need an explicit `Page` type.
- `node_modules` was **not** installed in the working tree. Type resolution for
  `playwright/test` and a real `tsc --noEmit` gate require `npm install` first
  (running in background now). `@playwright/test` (devDependency, `^1.58.2`) ships
  the `playwright/test` type declarations, so the bare specifier resolves once deps
  are present.
- `playwright.config.cjs` stays CommonJS (issue: keep as-is).

## Intended fix
For each of the 10 target files, create the `.ts` twin and delete the `.js` original.

### Files to convert (10, per issue)
| Current | Target | Notes |
|---|---|---|
| `e2e/helpers.js` | `e2e/helpers.ts` | `waitForProducts(page: Page): Promise<void>`, `waitForLoadingToFinish(page: Page): Promise<void>`, `import { type Page } from 'playwright/test'` |
| `e2e/home.spec.js` | `e2e/home.spec.ts` | annotate `page: Page` in async fns |
| `e2e/cart.spec.js` | `e2e/cart.spec.ts` | same |
| `e2e/pagination.spec.js` | `e2e/pagination.spec.ts` | same |
| `e2e/search-sort.spec.js` | `e2e/search-sort.spec.ts` | same |
| `e2e/category-filter.spec.js` | `e2e/category-filter.spec.ts` | same |
| `e2e/product-page.spec.js` | `e2e/product-page.spec.ts` | same |
| `e2e/accessibility.spec.js` | `e2e/accessibility.spec.ts` | same |
| `e2e/about.spec.js` | `e2e/about.spec.ts` | local `waitForAboutPageReady(page: Page)` helper must also be typed |

### NOT in scope (left as-is, out of issue's list)
- `e2e/fixtures.js` — stays JS; imports `./fixtures.js` not `./helpers.js`.
- `e2e/no-scrollbar.spec.js` — stays JS; imports `./fixtures.js`.
- `playwright.config.cjs` — stays CJS.

### Mechanical rules (so behaviour is unchanged)
- Keep `import { test, expect } from 'playwright/test'` exactly (bare specifier).
- Add `import { type Page } from 'playwright/test'` to every spec that takes `page`.
- Add `, type Page` to the `playwright/test` import where needed (single import line):
  `import { test, expect, type Page } from 'playwright/test'`.
- Inline arrow-function test bodies already receive `page` from Playwright's fixture
  destructuring (`async ({ page }) => {}`); these need **no** annotation — `page`
  is already `Page`. Only the **module-scope helper functions** (in `helpers.ts`
  and `about.spec.ts`) require an explicit `page: Page` parameter, matching the
  issue's requirement #2 ("Add type annotations for `page: Page` in async arrow
  functions where needed").
- Update the relative import in each spec from `'./helpers.js'` → `'./helpers.ts'`.
- No `any`, no behavioural edits, no assertion changes.

## Tasks (TDD-style)
Because the work is a 1:1 re-type, the "test" is **type-check + suite parity**, not
new behavioural unit tests. TDD mapping:
- **RED (anchor):** On the JS files, `npx tsc --noEmit` passes for `e2e` only by
  virtue of `allowJs`/`checkJs:false`. After converting, `tsc --noEmit` must still
  pass **with `strict`** (i.e. the `.ts` files are type-clean). The failure mode if
  we regress is a `tsc` error on an untyped `page` — so the green gate is a clean
  `tsc --noEmit`.
- **GREEN:** Convert all 10 files; delete 10 `.js` files; `npx tsc --noEmit` clean;
  `npm run test:e2e` passes (or is environment-skipped cleanly — it needs a built
  app + browsers; see Risks).
- **REFACTOR:** None required beyond deletion of originals; confirm `git status`
  shows only `.ts` additions + `.js` removals for `e2e/`.

## Files likely to change
- Added: `e2e/helpers.ts`, `e2e/{home,cart,pagination,search-sort,category-filter,
  product-page,accessibility,about}.spec.ts`
- Deleted: same 10 files with `.js` extension
- Untouched: `e2e/fixtures.js`, `e2e/no-scrollbar.spec.js`, `playwright.config.cjs`,
  `package.json`, `tsconfig.json`, all `src/`

## Validation
1. `npx tsc --noEmit` (project-wide) → **0 errors** (strict, includes `e2e`).
2. `ls e2e/*.js` → only `fixtures.js` and `no-scrollbar.spec.js` remain (10 `.js`
   converted+deleted).
3. `npm run test:e2e` → passes against the demo/mock catalogue. If the environment
   cannot run the full browser matrix (no `playwright install`/no built server), at
   minimum confirm `playwright test --config playwright.config.cjs --list` enumerates
   the converted specs and the import + type wiring is correct. Document any
   environment limitation honestly rather than faking a pass.

## Risks / open questions
- **Type resolution of `playwright/test`:** relies on `@playwright/test` types being
  installed. `npm install` is running in background; if it fails, the `tsc` gate
  cannot run and the conversion must be re-verified after install.
- **`npm run test:e2e` environment:** needs a dev/preview server + Playwright
  browsers. This is a long-running/network task; full suite execution may be skipped
  in this session with the limitation stated. The authoritative gate here is
  `tsc --noEmit` (strict) + spec enumeration.
- **`strict`/`noImplicitAny`:** every `page` parameter in helper functions must be
  explicitly typed `Page`; inline fixture `page` needs none. Risk of a missed
  annotation → caught by `tsc`.
- **No `any`:** issue DoD forbids `any`; `Page` from `playwright/test` covers all
  needs.

## Commit / PR plan
- Commit 1 (this branch): `plan(e2e): #128 convert E2E tests to TypeScript` — plan file.
- Commit 2 (after approval): `feat(e2e): #128 convert e2e specs + helpers to TS` —
  the 10 `.ts` files + 10 `.js` deletions.
- PR: `Closes #128`, references epic #122, notes `playwright.config.cjs` left as CJS
  and `fixtures.js`/`no-scrollbar.spec.js` intentionally out of scope.
