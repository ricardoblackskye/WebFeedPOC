# CSpell Spelling and Lychee Link Remediation Plan

> Follow strict TDD: write policy tests, verify RED, push for review, then implement after approval.

**Related issue:** #75 (incorporating #73 Lychee findings and #54 CSpell dictionary additions)

## Goal

Configure CSpell (`cspell.json` / `.cspell.json`) and Lychee (`.lycheeignore` / `.lychee.toml` / `.mega-linter.yml`) to resolve all 108 unknown word findings and 6 broken link errors reported by MegaLinter on `main` without suppressing linters globally, without ignoring core application source (`src/`), and while ensuring legitimate repository, framework, and domain vocabulary is preserved.

## Evidence

In MegaLinter run [31947806294](https://github.com/ricardoblackskye/WebFeedPOC/actions/runs/31947806294) on `main` (commit `c29635e8e4411f58a95f6aed0ffbf403cf1d79d9`):

1. **`SPELL_CSPELL` (108 errors across 29 files, 47 unique words):**
   - **Third-party Speckit agent/prompt templates (`.github/agents/`, `.github/prompts/` — 46 occurrences):** `Groot` (21), `underspecified`/`Underspecification` (4), `taskstoissues` (3), `TKTK`, `touchpoints`, `parallelizable`, and implement-agent ignore extensions (`terraformignore`, `helmignore`, `pycache`, `rlib`, `autom`, `swiftpm`, `Rproj`, `Ruserdata`, `packrat`, `renv`, `tfstate`, `tfvars`, `kubeconfig`).
   - **Repository code, workflows, tests, docs & plans (62 occurrences):**
     - CI Workflows & Git: `vitest`, `insightsengineering`, `ntvs`, `njsproj`
     - Application Source & API: `Replogle`, `CHAND`, `TELE`, `apos`, `giannadart`
     - Tests: `Anytown`, `GHSA`, `ghsa`, `xyzzy`
     - Documentation & Plans: `Lato`, `rgba`, `mindmap`, `behaviour`, `Customise`, `colours`, `refetches`, `prerendering`, `exploitability`, `artipacked`
     - MegaLinter generated artifact file names: `tanstack`, `vercel`, `vite`, `qwww`

2. **`SPELL_LYCHEE` (6 link errors across 6 files):**
   - `index.html:5`: Cannot resolve root-relative link `/vite.svg` (local file resolution error without root directory context in scanner).
   - `plans/fix-devskim-manifest-findings.md:13`: 404 on unauthenticated private CI action run URL `https://github.com/ricardoblackskye/WebFeedPOC/actions/runs/31720693378`.
   - `plans/fix-stylelint-css-rule-violations.md:13`: 404 on unauthenticated private CI action run URL `https://github.com/ricardoblackskye/WebFeedPOC/actions/runs/31796400309`.
   - `plans/security-remediate-ghsa-qwww-vcr4-c8h2.md:199`: 404 on unauthenticated private issue URL `https://github.com/ricardoblackskye/WebFeedPOC/issues/43`.
   - `public/robots.txt:5`: Connection failure on `https://www.antiquesmarketplace.co.uk/sitemap.xml`.
   - `WIX-API-INTEGRATION.md:223`: 404 on vendor placeholder URL `https://yoursite.wix.com/`.

## Technical Strategy

1. **CSpell Dictionary & Path Configuration (`cspell.json`):**
   - Populate `cspell.json` with all verified repository domain terms, tooling identifiers, and British/technical spellings:
     - Domain/Brand: `giannadart`, `Replogle`, `CHAND`, `TELE`, `Anytown`
     - Security/Advisories: `ghsa`, `GHSA`, `qwww`, `exploitability`
     - Tooling/Frameworks: `vitest`, `insightsengineering`, `artipacked`, `tanstack`, `vercel`, `vite`, `ntvs`, `njsproj`, `apos`, `mindmap`, `rgba`, `Lato`, `xyzzy`
     - British English variants used in product copy / plans: `behaviour`, `Customise`, `colours`, `refetches`, `prerendering`
     - Third-party template terms: `Groot`, `underspecified`, `Underspecification`, `taskstoissues`, `TKTK`, `touchpoints`, `parallelizable`, `terraformignore`, `helmignore`, `pycache`, `rlib`, `autom`, `swiftpm`, `Rproj`, `Ruserdata`, `packrat`, `renv`, `tfstate`, `tfvars`, `kubeconfig`
   - Configure `ignorePaths` in `cspell.json` to ignore MegaLinter transient report files (`megalinter-reports/**`, `*megalinter_file_names*.txt`).

2. **Lychee Link Checker Configuration (`.lycheeignore` or `.lychee.toml`):**
   - Add `.lycheeignore` (supported natively by Lychee in MegaLinter) with regex/prefix ignores for:
     - Private repository web URLs: `https://github.com/ricardoblackskye/WebFeedPOC/actions/runs/.*`, `https://github.com/ricardoblackskye/WebFeedPOC/issues/.*`
     - Placeholder vendor/demo domains: `https://yoursite.wix.com/.*`, `https://www.antiquesmarketplace.co.uk/.*`
     - Root-relative HTML links in static template check: `/vite.svg`
   - Preserve link verification for all public external documentation and internal relative markdown paths.

3. **Core Scope Protection:**
   - Ensure `src/` files are never ignored in `cspell.json` or `.lycheeignore`.
   - Ensure CSpell and Lychee linters remain fully enabled in `.mega-linter.yml` (no `DISABLE_LINTERS`).

## Testing Blueprint

### RED Policy Tests (`scripts/tests/cspell-lychee-remediation.policy.mjs`)
- **CSpell Word List Verification**: Assert `cspell.json` contains all 47 required repository, domain, technical, and third-party terms.
- **CSpell Ignore Paths Verification**: Assert `cspell.json` includes `ignorePaths` covering `megalinter-reports/**`.
- **Lychee Ignore Configuration Verification**: Assert `.lycheeignore` exists and contains ignore rules for private repository action/issue URLs, placeholder domains (`yoursite.wix.com`, `antiquesmarketplace.co.uk`), and root-relative static assets.
- **Core Path Protection**: Assert that `src/` is NOT ignored by CSpell or Lychee.

### Regression Suite
- `node --test scripts/tests/cspell-lychee-remediation.policy.mjs`
- `npm test -- --run`
- `npm run build`

## Edge Cases & Risk Analysis

| Scenario | Risk / Consideration | Mitigation |
|---|---|---|
| Overly broad Lychee suppression | Ignoring all `github.com` URLs would hide genuinely broken external links. | Narrow regex strictly to `https://github.com/ricardoblackskye/WebFeedPOC/(actions\|issues)/.*`. |
| CSpell case sensitivity | Acronyms like `GHSA` and `ghsa` appear in both uppercase and lowercase contexts. | Include both `GHSA` and `ghsa` in dictionary words. |
| Global linter disabling | Disabling `SPELL_CSPELL` or `SPELL_LYCHEE` would violate repository policy. | Keep all descriptors active and enforce configuration via local policy tests. |

## Acceptance Criteria

- [ ] `scripts/tests/cspell-lychee-remediation.policy.mjs` passes GREEN after implementation.
- [ ] `cspell.json` includes all 47 required words and appropriate ignore paths.
- [ ] `.lycheeignore` is created and properly scoped.
- [ ] Core application source code under `src/` remains fully monitored.
- [ ] All existing regression tests (`npm test -- --run`) and production build (`npm run build`) pass.
