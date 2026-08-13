import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const config = readFileSync(new URL('../../.mega-linter.yml', import.meta.url), 'utf8');

test('Grype remains a blocking security scanner', () => {
  assert.doesNotMatch(config, /DISABLE(?:_LINTERS)?[^\n]*REPOSITORY_GRYPE/);
  assert.doesNotMatch(config, /REPOSITORY_GRYPE_DISABLE_ERRORS/);
});

test('Grype has an explicit database reliability strategy', () => {
  assert.match(config, /REPOSITORY_GRYPE_(?:ARGS|PRE_COMMANDS|POST_COMMANDS|TIMEOUT_SECONDS|CONFIG_FILE|DISABLE_ERRORS_IF_LESS_THAN)/);
});

// Intentionally RED until a supported reliability strategy is configured.
void config;
