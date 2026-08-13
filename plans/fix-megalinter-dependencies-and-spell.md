# MegaLinter Dependency and Spelling Remediation Plan

> **For Hermes:** Follow the repository's strict TDD workflow: write validation tests, verify RED, push the tests for review, then implement after approval.

**Goal:** Resolve the CSpell finding from #54 and remediate the overlapping npm vulnerabilities reported by #52 (OSV-Scanner) and #53 (Trivy) on one feature branch.

**Architecture:** Add a repository-local CSpell dictionary/configuration and update the npm dependency graph through `package.json` plus a regenerated `package-lock.json`. Keep security scanner policy strict; do not suppress vulnerability findings or disable scanners.

**Technical Strategy:** Use a minimal `cspell.json` `words` entry for `ricardoblackskye`. First use npm's audit/updated dependency metadata to determine safe direct upgrades and transitive resolutions. Prefer compatible patched releases; major upgrades such as Vitest 4 or uuid 11+ require test/build verification and should not be forced blindly. Regenerate the lockfile with npm, then verify OSV/Trivy-equivalent dependency state locally as far as available.

**Testing Blueprint:** Add Node policy tests under `scripts/tests/` covering the CSpell dictionary and security-sensitive minimum dependency versions in `package.json`/lockfile. Tests must fail before the implementation exists, then pass after. Existing Vitest tests and production build are regression gates; Playwright should be run if browser dependencies are available.

---

## Current Context

- Repository: `ricardoblackskye/WebFeedPOC`
- Base: merged `main` at `5632942` (`ci: add MegaLinter validation (#49)`)
- Branch: `fix/megalinter-dependencies-and-spell`
- Issues: #52 OSV-Scanner, #53 Trivy, #54 CSpell
- Current `npm audit` reports vulnerabilities including `lodash`, `uuid`, `vite`, `vitest`, `postcss`, `rollup`, `form-data`, `flatted`, `minimatch`, `nanoid`, `picomatch`, `brace-expansion`, and transitive packages.

## Tasks

### Task 1: Write RED policy tests

**Create:** `scripts/tests/megalinter-remediation.policy.mjs`

Tests must assert:

- `cspell.json` exists and contains `ricardoblackskye` in its words list.
- `package.json` declares patched compatible versions for direct vulnerable packages where direct upgrades are needed.
- The lockfile contains no vulnerable installed versions for the explicitly identified `lodash` and `uuid` packages.
- The test reports a clear failure when the config/dependency remediation is absent.

Run:

```bash
node --test scripts/tests/megalinter-remediation.policy.mjs
```

Expected: RED because `cspell.json` is absent and the current dependency graph remains vulnerable.

### Task 2: Commit and push RED tests

```bash
git add plans/fix-megalinter-dependencies-and-spell.md scripts/tests/megalinter-remediation.policy.mjs
git commit -m "test: define MegaLinter remediation policy"
git push -u origin fix/megalinter-dependencies-and-spell
```

Stop for user review/approval before implementation.

### Task 3: Add CSpell dictionary

**Create:** `cspell.json`

Add only legitimate repository/project terms, beginning with `ricardoblackskye`. Validate that MegaLinter's CSpell discovery uses the file without disabling spell checking.

### Task 4: Remediate dependency vulnerabilities

**Modify:** `package.json`, `package-lock.json`

Use targeted npm updates. Check direct/transitive ownership first. Update patched packages and major versions only where required and compatible. Do not use `npm audit fix --force` without inspecting its proposed graph.

### Task 5: Verify GREEN

Run:

```bash
node --test scripts/tests/megalinter-remediation.policy.mjs
npm ci
npm test -- --run
npm run build
npm audit --omit=dev
```

Run Playwright if the environment supports its browser installation. Review remaining audit findings and record any residual dev-only or unfixable findings before claiming completion.

### Task 6: Push implementation and verify CI

Commit the implementation, push the branch, and inspect the MegaLinter, CI, and Vercel checks. Report exact outcomes and any remaining scanner findings.

## Edge Cases

| Scenario | Expected behavior | Coverage |
|---|---|---|
| CSpell dictionary is absent | Policy test fails clearly | RED test |
| Repository name is a proper noun | CSpell accepts it via local dictionary | CSpell policy test |
| Vulnerability is transitive | Upgrade the owning direct dependency or use a justified compatible override | Lockfile policy + npm audit |
| Fix requires a major version | Verify tests/build and peer dependencies before accepting | Full regression suite |
| Dev-only dependency vulnerability | Still remediate where practical; document runtime exposure if residual | npm audit review |
| npm registry resolves newer metadata than the original report | Use current scanner/audit output, not stale versions from the original run | verification |

## History Review

Previous security work for react-router used a dedicated regression test and a focused dependency remediation commit. Apply the same pattern: keep dependency changes isolated, regenerate the lockfile, and run the complete application suite before PR review.

## Acceptance Criteria

- [ ] RED policy tests were committed and pushed before implementation.
- [ ] `ricardoblackskye` is accepted by CSpell through repository configuration.
- [ ] Critical/High OSV and Trivy vulnerabilities are fixed or explicitly documented with risk acceptance.
- [ ] `package.json` and `package-lock.json` are consistent.
- [ ] Application tests and production build pass.
- [ ] MegaLinter-related checks are rerun on the branch.
- [ ] Issues #52, #53, and #54 are referenced in the PR.

---

## Execution Handoff

Stop after RED tests are pushed and obtain explicit user approval before writing `cspell.json` or changing dependency versions.