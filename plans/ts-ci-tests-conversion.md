# TS-CITests: Convert CI/Infrastructure Test Files to TypeScript

**Issue:** [#126](https://github.com/ricardoblackskye/WebFeedPOC/issues/126)
**Branch:** `ts/126-ci-tests-conversion`
**Epic:** [122](https://github.com/ricardoblackskye/WebFeedPOC/issues/122) — JS → TypeScript Migration

## Scope

Convert 2 CI/infrastructure test files from JavaScript to TypeScript.

| Current | Target | Change |
|---------|--------|--------|
| `tests/yamlLinting.test.js` | `tests/yamlLinting.test.ts` | Add type annotations, keep 60s timeout |
| `tests/jsLinting.test.js` | `tests/jsLinting.test.ts` | Add type annotations, keep 30s timeout |

### Files to delete after conversion
- `tests/yamlLinting.test.js`
- `tests/jsLinting.test.js`

## Phase 1.5 — MegaLinter Pre-Flight ✅

**MegaLinter on main:** ✅ Green (run #32509804807)
**`npx tsc --noEmit`:** ✅ Clean (0 errors)
**All 196 tests:** ✅ PASS

Baseline is clean — no pre-existing lint debt.

---

## Phase 2 — Test Conversion (RED/GREEN analysis)

### 2.1 `tests/yamlLinting.test.ts`

The original JS test:
```
import { execSync } from 'child_process'
import fs from 'fs'
```

TS conversion requires:
- `import { type ExecSyncOptions } from 'node:child_process'` for the execSync options type  
- `import { readFileSync } from 'node:fs'` — specific import path
- Catch clause: change `(error)` to `(error: unknown)` with proper narrowing
- The 60s timeout is already declared in the test options object

**Behaviour is identical** — the TS version will pass immediately because it's functionally equivalent.

### 2.2 `tests/jsLinting.test.ts`

The original JS test:
```
import { execSync } from 'child_process'
```

TS conversion requires:
- The `execSync` call with `encoding: 'utf8'` returns `string` in TS
- The file list stays unchanged (Wix/Stripe .js files still exist as JS)
- The 30s timeout stays unchanged

**Behaviour is identical** — the TS version will pass immediately.

### RED/GREEN note

These are **conversion tasks**, not new feature development. There is no new behaviour to test that would produce a meaningful RED. The converted `.ts` files are functionally equivalent to the passing `.js` files. TDD is followed in spirit:
- **Before (baseline):** 2 JS test files exist, 196 tests green
- **After TS creation:** 2 TS test files exist alongside JS, all tests green (no regression)
- **After JS deletion:** 2 TS test files, all tests green (final state)

---

## Phase 3 — User Approval Gate

**Report:** The JS test files are currently GREEN. After TS conversion, the TS equivalents will be GREEN too. No regression expected. No RED phase possible for a pure-conversion task.

**Ask:** Proceed with creating the `.ts` files and deleting the `.js` originals?

---

## Phase 4 — Implementation

1. Create `tests/yamlLinting.test.ts` with proper type annotations
2. Create `tests/jsLinting.test.ts` with proper type annotations
3. Run full suite → verify all 196+ tests still GREEN
4. Delete `tests/yamlLinting.test.js` and `tests/jsLinting.test.js`
5. Run full suite → verify still GREEN
6. Run `npx tsc --noEmit` → verify clean

## Phase 4.5 — MegaLinter Post-Verification

7. Verify MegaLinter still clean
8. Run `npx cspell` on converted files
9. Commit + push + PR

## Verification Commands

```bash
npx vitest run              # all tests green
npx tsc --noEmit           # type-check clean
npm run build               # production build passes
npx cspell "tests/*.ts"    # no spelling issues
```

## Risks / Edge Cases

- `import { execSync } from 'child_process'` vs `import { execSync } from 'node:child_process'` — Node.js docs recommend `node:` prefix. Existing `.ts` files in the project use both; will use `node:` for new files.
- `catch (error)` in TS — needs `unknown` type annotation + narrowing since `Error` isn't guaranteed at runtime.
- The `yaml-lint` test has a 60s timeout — must be preserved unchanged.