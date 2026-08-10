# Remediate GHSA-qwww-vcr4-c8h2 React Router Security Advisory

> **For Hermes:** Follow the strict TDD workflow. Review this plan first. After approval, write the complete regression/unit/E2E test suite, verify RED, stop for the next approval gate, then implement the dependency remediation and any required compatibility changes.

**Goal:** Remove the vulnerable React Router dependency range associated with GHSA-qwww-vcr4-c8h2, verify whether WebFeedPOC is actually exposed to the affected request mode, and leave the repository with a patched, tested and documented dependency configuration.

**Architecture:** WebFeedPOC is currently a Vite React 18 single-page application using `BrowserRouter` and `Routes` in `src/main.jsx`. It also has a separate static prerender experiment using `StaticRouter` in `src/entry-server.jsx`, but it is not currently a React Router Framework Mode application and does not use React Router RSC routes or server actions. The remediation will therefore treat dependency upgrade and runtime-mode verification as one security change, while explicitly testing the SSR/prerender path because the repository contains server-rendering code.

**Technical Strategy:**
- Confirm the exact resolved versions from `package-lock.json`/`npm ls`; the current checkout declares and resolves `react-router-dom` and `react-router` at `7.13.0`.
- Confirm the advisory facts against the upstream GitHub advisory and Aikido references. GHSA-qwww-vcr4-c8h2 is broader than the two related Aikido records; do not close the issue solely because the current app appears to use BrowserRouter SPA mode.
- Inspect the application for React Router Framework Mode, RSC, server actions, loaders/actions, forwarded-host validation, and hydration error deserialization. Record the evidence and residual-risk assessment.
- Determine the lowest compatible patched version that clears GHSA-qwww-vcr4-c8h2 and the related Aikido findings, then prefer the latest supported compatible release rather than a permissive vulnerable semver range. Verify the available `react-router-dom` release and its matching `react-router` dependency before editing manifests.
- Upgrade direct dependencies and regenerate `package-lock.json` with a clean install. Do not use `npm audit fix --force` as the remediation mechanism.
- Preserve the current BrowserRouter route behavior, SSR StaticRouter behavior, React 18 compatibility, Vite build, Wix integration boundaries and Playwright configuration.
- Add a security verification script/test that asserts the resolved React Router packages are outside the affected versions and that the application is not silently relying on Framework Mode-only behavior.
- Add SSR/prerender regression coverage for the route tree and malformed/attacker-shaped hydration/error metadata where the current architecture can exercise it. If a specific Framework Mode exploit path is structurally impossible, test and document that boundary rather than inventing an irrelevant test.
- Keep the security test deterministic and offline. Dependency advisories must be checked by resolved version and lockfile state; live Aikido access is not required for the test suite.

**Testing Blueprint:**
- Dependency-resolution tests/scripts: `npm ls react-router react-router-dom`, lockfile assertions, and a check that no resolved package is in each affected range.
- Advisory-range coverage: GHSA-qwww-vcr4-c8h2 range, AIKIDO-2026-274519 range, and AIKIDO-2026-740941 range must all be represented in the verification logic or documented as covered by the selected patched version.
- Runtime-mode regression tests: confirm `src/main.jsx` uses the intended SPA router and that no Framework Mode/RSC/server-action entry point is accidentally introduced.
- SSR/prerender tests: render `/`, a product route, and a category route through `src/entry-server.jsx` with a deterministic product fixture; assert no browser-only API crash and no missing router/provider context attributable to the React Router upgrade.
- Security-focused malformed-data test: pass an attacker-shaped serialized error/metadata fixture through the relevant SSR/prerender boundary and assert that no arbitrary constructor lookup or executable object hydration path exists in application code.
- Existing unit/component suite: `npm test -- --run`.
- Production client build: `npm run build`.
- Exact deployment/prerender command: `npm run build:prerender`; this must complete with all expected pages rendered and no advisory-related SSR regression.
- Browser E2E suite: `PLAYWRIGHT_BROWSERS_PATH=/opt/data/playwright-browsers npm run test:e2e`.
- Clean-install verification: remove dependencies in a detached/clean checkout and run `npm ci` before all gates.

---

## Current Context and Evidence

### Current dependency state

- `package.json` declares `react-router-dom: ^7.13.0`.
- `package-lock.json` currently resolves:
  - `react-router-dom: 7.13.0`
  - `react-router: 7.13.0`
- `react-router-dom` depends on the matching `react-router` version.
- The broad GHSA and Aikido references identify affected React Router ranges and patched versions that need to be reconciled with the current package release line before implementation.

### Current application mode

- `src/main.jsx` uses `BrowserRouter`, `Routes` and `Route` for the browser SPA.
- `src/entry-server.jsx` uses `StaticRouter`, `Routes` and `Route` for prerendering.
- There is no observed `createRequestHandler`, React Router Framework Mode config, RSC entry point, or React Router server action implementation in the current source tree.
- `vite.config.js` bundles `react-router-dom` and `react-router` for SSR.
- `scripts/prerender.mjs` imports the SSR bundle and renders routes to HTML.

This evidence suggests the specific Framework Mode attack paths may not be reachable in the current production architecture, but the dependency remains inside Aikido's affected ranges and must be upgraded or otherwise explicitly risk-accepted by the project owner.

### Existing related issues

- #43 — this remediation issue.
- #44 — AIKIDO-2026-274519, CSRF validation bypass in Framework Mode.
- #45 — AIKIDO-2026-740941, unsafe hydration deserialization in Framework Mode.

The implementation should cross-reference the result of this work in #44 and #45, but must not assume that resolving one package version automatically proves every runtime-mode claim.

### Repository history reviewed

| Commit | Finding | Lesson applied |
|---|---|---|
| `a460631` | Added Playwright E2E coverage | Retain and run browser-level route/navigation verification after dependency changes. |
| `af9edd0` | Added TanStack Query | Preserve the existing query/provider structure while testing SSR and browser entry points separately. |
| `7084678` | Added Wix headless content and corrected linting | Avoid changing Wix integration behavior while making the security-only dependency update. |
| `d85ee77` | Added background refresh | Verify route/data refresh behavior is unaffected by the router upgrade. |
| `df3e131` | Filtered variant products | Preserve product route and catalogue behavior; run product-page E2E coverage. |

---

## Edge-Case Analysis

| # | Scenario | Expected behavior | Test/verification |
|---|---|---|---|
| 1 | Lockfile resolves an affected React Router version after a manifest edit | Fail before implementation is considered complete | Dependency-range check + clean `npm ci` |
| 2 | `react-router-dom` and `react-router` resolve to mismatched versions | Reject the dependency tree | `npm ls` and lockfile assertion |
| 3 | Latest patched release requires a breaking React Router API change | Do not force the upgrade blindly; document compatibility decision and implement the smallest safe migration | Build/unit/E2E gates plus plan note |
| 4 | Current SPA is not Framework Mode | Record reduced exploitability, but still remove the affected dependency range | Runtime-mode test and security note |
| 5 | SSR StaticRouter route renders after upgrade | Preserve output and route behavior | SSR route fixture tests |
| 6 | SSR import touches `localStorage` or another browser global | Do not crash prerender | SSR regression test |
| 7 | Malformed serialized error metadata reaches hydration boundary | No arbitrary constructor lookup or executable deserialization path | Security-focused malformed-data test |
| 8 | Browser direct navigation to product/category URL | Page renders rather than 404ing during data load | Playwright product/category tests |
| 9 | Wix API unavailable during tests | Use deterministic fixture/demo test mode; do not make security verification depend on live Wix credentials | Existing mock/fixture setup |
| 10 | Playwright browser cache is absent in a clean environment | Document/install the required browser or use CI-managed browser installation | E2E command and setup documentation |
| 11 | `npm audit` reports other unrelated vulnerabilities | Separate them from this issue and avoid scope creep | Record remaining advisory IDs for #42 |
| 12 | Dependency upgrade changes redirect behavior | Preserve safe internal navigation and reject unsafe external schemes | Existing route tests plus redirect audit |

---

## Proposed Implementation Tasks

### Task 1: Establish the security regression harness

**Files:**
- Create: `scripts/check-react-router-security.mjs` or an equivalent test utility.
- Create: `scripts/check-react-router-security.test.mjs` or a Vitest test under `src/`.
- Create: `src/security/reactRouterSecurity.test.jsx` for runtime-mode/SSR assertions where appropriate.
- Modify: `package.json` only to add a clearly named verification script if needed.

**TDD sequence:**
1. Write a failing dependency-range test that models the currently resolved `7.13.0` as affected by the referenced advisory ranges.
2. Write failing SSR/runtime-mode tests that define the required safe behavior without changing production code.
3. Run only the new tests and confirm they fail for the expected missing-remediation reasons, not from test typos.
4. Stop for the user approval gate before changing `package.json`, `package-lock.json`, or application code.

### Task 2: Select and apply the patched dependency version

**Files:**
- Modify: `package.json`.
- Modify: `package-lock.json`.

**Implementation requirements:**
- Verify the available patched `react-router-dom` release and matching `react-router` version.
- Pin or constrain the dependency so the vulnerable range cannot be selected by a normal clean install.
- Keep React 18 and current Vite compatibility unless evidence requires a reviewed migration.
- Use `npm install`/lockfile regeneration, then verify with `npm ci`.

**Verification:**
- Dependency security tests turn green.
- `npm ls react-router react-router-dom` shows the intended versions with no invalid/multiple unexpected vulnerable copies.
- `npm audit` output is captured; unrelated findings remain tracked separately.

### Task 3: Preserve and verify the browser route tree

**Files likely to change only if the dependency upgrade requires it:**
- `src/main.jsx`.
- `src/pages/ProductPageWrapper.jsx`.
- `src/pages/CategoryPage.jsx`.
- Relevant route/component tests.

**Behavior:**
- Preserve `/`, `/products/:slug`, `/category/:categoryName`, `/about`, `/orders` and order confirmation routes.
- Preserve internal links, encoded category names, product navigation and browser back/forward behavior.
- Do not introduce Framework Mode/RSC APIs as a workaround.

**Verification:**
- Unit/component suite passes.
- Playwright route, category, product, pagination, search and cart tests pass.

### Task 4: Verify the SSR/prerender boundary

**Files likely to change if required by the security upgrade or existing SSR failures:**
- `src/entry-server.jsx`.
- `scripts/prerender.mjs`.
- `src/services/wixSession.js` only if browser-global access blocks the security regression harness.
- SSR-specific tests/fixtures.

**Behavior:**
- StaticRouter renders deterministic routes without browser-only globals.
- Router and TanStack Query providers are present where required.
- No untrusted error metadata can select arbitrary constructors.
- Prerender output and security checks fail closed when unsafe or incomplete.

**Verification:**
- `npm run build:prerender` passes with expected page count and meaningful HTML.
- SSR tests cover malformed data and route output.

### Task 5: Full verification and security handoff

**Commands:**
```bash
rm -rf node_modules
npm ci
npm ls react-router react-router-dom
npm test -- --run
npm run typecheck  # if/when a typecheck script exists; otherwise record not configured
npm run build
npm run build:prerender
PLAYWRIGHT_BROWSERS_PATH=/opt/data/playwright-browsers npm run test:e2e
npm audit
```

**Handoff evidence:**
- Exact resolved dependency versions.
- Advisory ranges and why the selected version clears them.
- Framework Mode/RSC applicability assessment.
- Test counts and pass/fail output.
- Any unrelated vulnerabilities linked to #42 rather than silently folded into this issue.
- Updated README/security note if the runtime-mode decision or dependency policy needs documenting.

---

## Out of Scope

- Fixing every npm audit finding; track unrelated vulnerabilities in #42.
- Replacing React Router or migrating to Framework Mode.
- Implementing new SSR features unrelated to proving the security boundary.
- Adding live Wix credentials to the repository or test environment.
- Broad UI redesign or product-catalogue changes.

## Approval Gate

This is a plan-only commit. Do not write production code or tests until Richard reviews and approves this plan. After approval, write the new tests first, run them, and report the explicit RED state. Stop again for approval before dependency or implementation changes.

**Issue:** #43 — https://github.com/ricardoblackskye/WebFeedPOC/issues/43
**Branch:** `security/remediate-ghsa-qwww-vcr4-c8h2`
**Plan file:** `plans/security-remediate-ghsa-qwww-vcr4-c8h2.md`
**Current baseline:** `main` at `2f491b8`.

## Plan Review Questions

1. Should the implementation target the latest patched `react-router-dom` release compatible with React 18, or should it target the minimum fixed release once compatibility is established?
2. Is the current `build:prerender` path intended for production, or should the security fix verify only the browser SPA and document SSR as a separate issue?
3. Should the dependency be pinned exactly for repeatable security scanning, or retain a safe semver range above the patched version?

These questions do not block the initial review; the implementation phase must record the chosen answers before modifying dependencies.

## Historical Note

The plan deliberately includes SSR/prerender verification because the repository contains `src/entry-server.jsx` and `scripts/prerender.mjs`, even though the current browser architecture is a Vite `BrowserRouter` SPA rather than React Router Framework Mode.

## End
