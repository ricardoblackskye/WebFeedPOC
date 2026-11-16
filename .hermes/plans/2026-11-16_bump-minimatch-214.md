# Plan: clear the osv-scanner finding so MegaLinter is green on `main`

Story: #214

## Goal

`osv-scanner` is a **required** MegaLinter descriptor and it reports one vulnerable package, so MegaLinter is
red on every branch of this repository — including `main`. That blocks the Dark Factory: the Definition of Done
reads the pull request's own checks, so no run against this repository can ever report done. Clear the finding
without changing runtime behaviour.

## Root cause (verified)

The vulnerable copy is **nested**, not the top-level one a glance would find. Read from `package-lock.json`
(639 entries) and the npm registry, not from prose:

| Resolved copy                                                              | Version  | Vulnerable |
|----------------------------------------------------------------------------|----------|------------|
| `node_modules/@typescript-eslint/typescript-estree/node_modules/minimatch` | `10.2.6` | **yes**    |
| `node_modules/@eslint/config-array/node_modules/minimatch`                 | `3.1.5`  | no         |
| `node_modules/@eslint/eslintrc/node_modules/minimatch`                     | `3.1.5`  | no         |
| `node_modules/eslint/node_modules/minimatch`                               | `3.1.5`  | no         |

The parent, `@typescript-eslint/typescript-estree@8.72.1`, declares `minimatch: ^10.2.2`. A caret on a 10.x
range caps below 11, and `10.2.6` is the **last** 10.x release — so no in-range fix exists. Every other copy is
on the 3.x line and is unaffected by this advisory.

## Intended fix

**Take the parent's own release. No override.**

Verified on the registry: `@typescript-eslint/typescript-estree@8.73.0` — the current latest, one minor above
what is installed — declares `minimatch: ^11.0.1`. The repository's declared range `^8.72.1` **already admits**
`8.73.0`, so a resolution bump moves the parent and the nested copy together, with no override and no
untested combination.

- `npm update @typescript-eslint/typescript-estree` (moves 8.72.1 -> 8.73.0, and `minimatch` 10.2.6 -> 11.0.x).
- Raise the declared floor in `package.json` from `^8.72.1` to `^8.73.0`, so a fresh install cannot resolve
  back into the vulnerable range. Correctness must not depend on the lockfile alone.
- **No `overrides` entry.** The repository already carries one (`source-map-js: 1.2.2`) and the guidance is to
  amend overrides in place rather than add them — but an override is not needed here, and an override outlives
  its reason. Forcing `minimatch` 11 under a parent that pins `^10.2.2` would run a combination upstream never
  tested, which is the risk this approach avoids.

`minimatch@11.0.1` declares `engines: { node: "18 || 20 || >=22" }`, so Node 20 — what this repository's CI
uses — is supported. No engine conflict.

## Tasks (TDD phases)

This is a lockfile change, so the RED anchor is a **guard test** that fails today and passes after the bump.
That is a genuine failing test, not a formality: it fails on the vulnerable `10.2.6` copy that is installed now.

1. **RED** — add `tests/dependency-vulnerabilities.test.js`, reading `package-lock.json` and failing if any
   resolved `minimatch` copy sits strictly below the first patched version. Include the non-vacuity anchor
   (assert it found at least one copy, so a collection over an empty tree cannot pass while protecting
   nothing) and the boundary case (the first patched version must NOT be flagged, only strictly-below it).
   Confirm it fails against the current lock, naming the nested `10.2.6` copy.
2. **GREEN** — `npm update @typescript-eslint/typescript-estree`, then raise the floor in `package.json`.
   Confirm the guard passes, then enumerate every resolved copy with `npm ls minimatch --all` and confirm none
   sits below the patched version.
3. **Prove the lock diff is confined.** Build `{key: version}` maps from `git show origin/main:package-lock.json`
   and the working copy and print the symmetric difference. Every changed key must be one of the two target
   packages or a platform binary of one; anything else is a finding to explain, not churn to accept.
4. **Run the repository's own gates** — `npm run lint`, `npm run typecheck`, `npx vitest run`, `npm run build`.

## Files likely to change

| Path                                       | Change                                                  |
|--------------------------------------------|---------------------------------------------------------|
| `package-lock.json`                        | regenerated resolution (the parent and the nested copy) |
| `package.json`                             | `typescript-eslint` floor raised to `^8.73.0`           |
| `tests/dependency-vulnerabilities.test.js` | new guard test                                          |

## Validation

- `npx osv-scanner --lockfile package-lock.json` reports zero findings for `minimatch`.
- The guard test fails before the bump and passes after.
- `npm run lint`, `npm run typecheck`, `npx vitest run` and `npm run build` all pass.
- MegaLinter on the pull request is green, and `osv-scanner` in particular.
- Re-query the Dependabot alerts API after the merge: "merged" is not "closed", and the scanner runs its own scan on
  its own schedule. Report the count.

## Risks and open questions

- **Reachability is low, and that is evidence rather than reassurance.** The vulnerable copy is reached through
  `@typescript-eslint/typescript-estree`, a dev-only dependency used for TypeScript parsing and glob matching at
  lint time. It is not on a runtime request path, and the advisory is a denial-of-service class. This does not
  change the fix — a required descriptor blocks the factory regardless — but it is why a parent bump is
  proportionate rather than a large migration.
- **The parent moves one minor (8.72.1 -> 8.73.0).** Its own changes ride along. Read its release notes before
  merging; the repository's lint and typecheck gates are the acceptance test for the surface it exposes.
- **A fresh install must not resolve back.** Hence the raised floor, not only the lock update. Confirm with a
  clean `npm ci` and a re-read of the resolved copies.
- **Scope boundary:** #215 (removing Cspell from MegaLinter) is a separate change and is deliberately not part
  of this branch.

## No ADR

This change adds no override and no non-obvious mechanism, so there is no decision a future developer would
have to re-derive: the raised floor and the guard test record the reason in the code itself.
