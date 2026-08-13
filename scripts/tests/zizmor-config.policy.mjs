import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = readFileSync(new URL('../../.mega-linter.yml', import.meta.url), 'utf8');

test('zizmor receives only the GitHub token for online audits', () => {
  assert.match(config, /ACTION_ZIZMOR_UNSECURED_ENV_VARIABLES:\s*\n\s*-\s*GITHUB_TOKEN/);
  assert.doesNotMatch(config, /ZIZMOR_NO_ONLINE_AUDITS/);
  assert.doesNotMatch(config, /github_pat_|secrets\.PAT/);
});

// This test is intentionally RED until the narrow configuration is added.
void config;
