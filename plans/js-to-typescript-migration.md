# JS → TypeScript Migration Plan

**Epic:** [#122](https://github.com/ricardoblackskye/WebFeedPOC/issues/122)

## Scope

Convert all non-Wix, non-Stripe `.js` files (excluding `.jsx`) to TypeScript. Each source file gets a `.ts` counterpart, and each test file becomes `.test.ts`.

### Excluded (remain as `.js`)
- `api/wix-*.js` — Wix API functions
- `src/hooks/useWix*.js` — Wix React hooks
- `src/services/wix*.js` — Wix service layer
- `src/services/stripeService*.js` — Stripe service
- All `.jsx` component files

## Sub-issues (ordered by dependency)

| # | Issue | Area | Files | Depends on |
|---|-------|------|-------|-----------|
| 1 | [#123](https://github.com/ricardoblackskye/WebFeedPOC/issues/123) | **Project infra** | `tsconfig.json`, `vite.config.ts`, `package.json`, `.mega-linter.yml` | — |
| 2 | [#124](https://github.com/ricardoblackskye/WebFeedPOC/issues/124) | **Utils** | `helpers.ts`, `structuredData.ts`, tests | 1 |
| 3 | [#125](https://github.com/ricardoblackskye/WebFeedPOC/issues/125) | **Test infra** | `test-setup.ts`, `copyPasteHelpers.ts`, new test | 1 |
| 4 | [#126](https://github.com/ricardoblackskye/WebFeedPOC/issues/126) | **CI tests** | `yamlLinting.test.ts`, `jsLinting.test.ts` | 1 |
| 5 | [#127](https://github.com/ricardoblackskye/WebFeedPOC/issues/127) | **Security** | `reactRouterSecurity.test.ts` | 1 |
| 6 | [#128](https://github.com/ricardoblackskye/WebFeedPOC/issues/128) | **E2E tests** | `helpers.ts` + 8 `*.spec.ts` | 1 |

## Execution order

1. **Phase 1** (can be parallelised after infra is up):
   - #123 Project infra (must be first — sets up TS toolchain)
   - #124 Utils
   - #125 Test infra

2. **Phase 2** (after Phase 1 infra is merged):
   - #126 CI tests
   - #127 Security
   - #128 E2E tests

## Cross-cutting concerns

- **TypeScript config**: strict mode, `bundler` module resolution, include `src/`, `tests/`, `e2e/`
- **Build**: Vite already handles `.ts` via esbuild — no plugin needed
- **Testing**: Vitest resolves `.ts` natively — adjust `setupFiles` and `coverage.exclude` paths
- **MegaLinter**: Update `JAVASCRIPT_STANDARD_FILTER_REGEX_EXCLUDE` — converted `.js`→`.ts` no longer need exclusion; add `*.ts` exclusion from JS Standard linter
- **package.json**: Remove converted files from `standard.ignore`; consider adding `typescript` to devDeps

## Verification

```bash
npm run build       # must pass
npm run test        # all unit tests green
npm run test:e2e    # all E2E tests green (requires app running)
npm run lint        # MegaLinter passes (CI check)
```