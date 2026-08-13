# Zizmor Authentication Fix Plan

> **For Hermes:** Follow strict TDD: write the policy test, verify RED, push it for review, then implement after approval.

**Goal:** Restore authenticated online zizmor audits for the private repository without introducing a PAT or disabling `ref-confusion`.

**Architecture:** Keep the existing MegaLinter workflow and expose only the built-in `GITHUB_TOKEN` to the zizmor subprocess through `.mega-linter.yml`.

**Technical Strategy:** Add `ACTION_ZIZMOR_UNSECURED_ENV_VARIABLES: [GITHUB_TOKEN]`. Preserve current workflow permissions and report artifacts. Add a deterministic policy test for the configuration.

**Testing Blueprint:** Node policy tests assert the exact whitelist and ensure no PAT or offline-audit bypass is added.

## Tasks

1. Create `scripts/tests/zizmor-config.policy.mjs` and assert the required whitelist; run it RED.
2. Commit/push RED tests for review.
3. Add the narrow `.mega-linter.yml` configuration.
4. Run policy, YAML/diff, application tests, and build.
5. Push implementation and inspect MegaLinter.

## Edge cases

- `GITHUB_TOKEN` must be whitelisted only for zizmor, not globally.
- No PAT should be required for public `actions/*` references.
- `ref-confusion` must remain online and enabled.

## Acceptance criteria

- Policy test passes.
- No PAT or `ZIZMOR_NO_ONLINE_AUDITS` is introduced.
- MegaLinter's `ACTION_ZIZMOR` passes or reports a distinct remaining issue.
- Existing CI remains green.

Related issue: #47.

## Execution handoff

Stop after RED tests are pushed and obtain approval before implementation.

---

## RED test

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = readFileSync(new URL('../../.mega-linter.yml', import.meta.url), 'utf8');

test('zizmor receives only the GitHub token for online audits', () => {
  assert.match(config, /ACTION_ZIZMOR_UNSECURED_ENV_VARIABLES:\s*\n\s*-\s*GITHUB_TOKEN/);
  assert.doesNotMatch(config, /ZIZMOR_NO_ONLINE_AUDITS/);
  assert.doesNotMatch(config, /github_pat_|secrets\.PAT/);
});
```

Expected RED: the whitelist is absent from the current configuration.

---

## History review

The prior MegaLinter implementation added private checkout credentials after MegaLinter's Git diff inspection failed. This fix addresses the separate zizmor subprocess environment boundary and keeps the security audit online.