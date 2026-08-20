# Plan: TypeScript Infrastructure Setup (#123)

**Issue:** https://github.com/ricardoblackskye/WebFeedPOC/issues/123

## Summary

Set up the TypeScript toolchain so subsequent TS conversion stories can compile and run. This is a project-infrastructure change — no source code behaviour is modified.

## Tactical TDD approach

Since this is configuration/infrastructure, not feature code, we apply TDD via **policy tests** that assert the target state exists.

### RED tests to write

| Test | Assertion | Current state |
|------|-----------|---------------|
| `tsconfig.json exists` | File exists with `compilerOptions.strict === true` | File does not exist |
| `vite.config.ts exists` | `.ts` config file exists | `vite.config.js` exists instead |
| `typescript in devDeps` | `typescript` in `package.json.devDependencies` | Not present |
| `jsconfig.json removed` | File no longer exists | Currently exists |
| `vite.config.js removed` | File no longer exists | Currently exists |
| `build succeeds with TS config` | `npm run build` exits 0 | Needs tsconfig first |

### Implementation steps (TDD GREEN)

1. `npm install --save-dev typescript @types/node`
2. Create `tsconfig.json` (migrate from `jsconfig.json`, strict mode)
3. Convert `vite.config.js` → `vite.config.ts` with type annotations
4. Update `package.json` — remove JS paths from `standard.ignore`
5. Delete `jsconfig.json`, old `vite.config.js`
6. Update `.mega-linter.yml` exclusion regex from `*.js` to `*.ts` scope
7. Verify `npm run build` and `npm run test` both pass

## MegaLinter concerns

- Current `JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE: "(?i).*(wix|stripe).*\\.js$"` — this excludes Wix/Stripe `.js` files from JS Standard. When we create `.ts` config files, Standard won't flag `.ts` files anyway (it only lints `.js`). So no change needed to the exclusion unless new `.ts` files are mistakenly picked up.
- The `standard.ignore` in `package.json` has old paths like `api/wix-*.js`, `src/hooks/useWix*.js`, `src/services/stripeService*.js` — these stay since those files stay as JS.

## Risks

- Vite config changes could break build if TS types don't match
- `vitest` setup file path change (`./src/test-setup.js` → `./src/test-setup.ts`) must be updated in `vite.config.ts`
- MegaLinter may need a Typescript linter descriptor added

## Delivered artifacts

- `tsconfig.json`
- `vite.config.ts`
- `package.json` (updated)
- `.mega-linter.yml` (updated, if needed)
- `scripts/tests/ts-infra.policy.mjs` (policy test, stays as part of the repo)
- `plans/ts-infra-setup.md` (this file)