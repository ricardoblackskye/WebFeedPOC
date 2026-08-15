# Third-Party and Vendor Tooling Exclusion Plan for MegaLinter

> Follow strict TDD: write policy tests, verify RED, push for review, then implement after approval.

**Related issue:** #80

## Goal

Configure MegaLinter and tool-native configuration files to exclude third-party vendor tooling (specifically `.specify/` and Speckit extensions/scripts) and external serverless API glue code (`api/wix-*.js`) so that third-party artifacts do not trigger false positive failures or noisy warnings across linters (PowerShell, ShellCheck/shfmt/bash-exec, Yamllint/Prettier, JS Standard, and jscpd), while ensuring repository core business logic (`src/`, GitHub workflows, `scripts/`) remains strictly monitored.

## Evidence

MegaLinter checks in recent CI runs reported numerous errors originating from third-party/vendor assets:
1. `POWERSHELL_POWERSHELL`: PSScriptAnalyzer warnings in `.specify/scripts/powershell/` and `.specify/extensions/git/scripts/powershell/`.
2. `BASH_SHELLCHECK`, `BASH_SHFMT`, `BASH_EXEC`: ShellCheck and formatting warnings in `.specify/extensions/git/scripts/bash/`.
3. `YAML_YAMLLINT` & `YAML_PRETTIER`: Indentation and formatting errors in `.specify/extensions/` and `.specify/workflows/`.
4. `JAVASCRIPT_STANDARD`: Style violations in serverless integration handlers (`api/wix-*.js`).
5. `COPYPASTE_JSCPD`: Duplication clones detected across `.specify/scripts/` and between `api/wix-cart.js` and `api/wix-checkout.js`.

These files represent external framework tooling and vendor integration glue code rather than core repository business logic.

## Technical Strategy

1. **MegaLinter Directory Exclusions (`.mega-linter.yml`):**
   - Add `.specify` to `ADDITIONAL_EXCLUDED_DIRECTORIES` so linters ignore all files in `.specify/`.
   - Set `FILTER_REGEX_EXCLUDE: "(^|/)(\\.specify)/"` to ensure regex-based filter exclusion across all descriptors.
2. **Duplication Detector (`.jscpd.json`):**
   - Expand `.jscpd.json` `ignore` array to include `**/.specify/**` and `**/api/wix-*.js`, preserving `threshold: 0` for all application and test code.
3. **JavaScript Standard Style Configuration (`package.json`):**
   - Configure `"standard": { "ignore": ["api/wix-*.js", ".specify/**"] }` in `package.json` so Standard JS ignores third-party serverless integration files.
4. **Scope Protection:**
   - Ensure primary application code (`src/`), deployment scripts (`scripts/`), and GitHub Actions workflows (`.github/workflows/`) remain actively linted and tested without broad suppresses.

## Testing Blueprint

### RED Policy Tests (`scripts/tests/third-party-exclusions.policy.mjs`)
- **MegaLinter Configuration Exclusions:** Assert `.mega-linter.yml` contains `.specify` in `ADDITIONAL_EXCLUDED_DIRECTORIES` and `FILTER_REGEX_EXCLUDE`.
- **jscpd Duplication Configuration:** Assert `.jscpd.json` contains `**/.specify/**` and `**/api/wix-*.js` in `ignore`, and maintains `threshold: 0`.
- **JavaScript Standard Linter Configuration:** Assert `package.json` specifies `"standard"` ignore rules for `api/wix-*.js` and `.specify/**`.
- **Core Code Protection:** Assert that primary production paths (`src/`, `scripts/`, `.github/workflows/`) are NOT included in ignore patterns.

### Regression Suite
- `node --test scripts/tests/*.policy.mjs`
- `npm test -- --run` (all unit and component tests passing)
- `npm run build` (production build succeeds)

## Edge Cases & Risk Analysis

| Scenario | Risk / Consideration | Mitigation |
|---|---|---|
| Over-broad regex exclusion | Using a pattern like `wix.*` might accidentally ignore `src/services/wixService.js`. | Scope regex and file ignores strictly to `api/wix-*.js` and `.specify/**`. |
| CI YAML indentation | Modifying `.mega-linter.yml` must not introduce YAML syntax errors. | Strictly follow YAML formatting with document start `---` and 2-space indentation. |
| jscpd threshold drift | Relaxing `threshold` could mask regressions in application source. | Enforce `threshold: 0` in policy assertions. |

## Acceptance Criteria

- [ ] `scripts/tests/third-party-exclusions.policy.mjs` passes GREEN after implementation.
- [ ] `.specify/` is excluded from all MegaLinter descriptors.
- [ ] `api/wix-*.js` is excluded from JS Standard and jscpd duplication checks.
- [ ] Core repository application code in `src/`, `scripts/`, and `.github/` remains fully guarded.
- [ ] All existing regression tests (`npm test -- --run`) and build (`npm run build`) pass.
