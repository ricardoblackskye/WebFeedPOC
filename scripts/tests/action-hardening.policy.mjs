import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const ci = readFileSync(new URL('.github/workflows/ci.yml', root), 'utf8');
const mega = readFileSync(new URL('.github/workflows/mega-linter.yml', root), 'utf8');
const spell = JSON.parse(readFileSync(new URL('cspell.json', root), 'utf8'));

const sha = '[0-9a-f]{40}';

test('all CI actions are pinned to immutable commit SHAs', () => {
  assert.match(ci, new RegExp(`actions/checkout@${sha}`));
  assert.match(ci, new RegExp(`actions/setup-node@${sha}`));
});

test('all MegaLinter actions are pinned to immutable commit SHAs', () => {
  for (const action of ['actions/checkout', 'oxsecurity/megalinter', 'actions/upload-artifact']) {
    assert.match(mega, new RegExp(`${action}@${sha}`));
  }
});

test('normal CI uses read-only permissions and discards checkout credentials', () => {
  assert.match(ci, /permissions:\s*\n\s*contents:\s*read/);
  assert.match(ci, /persist-credentials:\s*false/);
});

test('MegaLinter retains checkout credentials for private Git inspection', () => {
  assert.match(mega, /persist-credentials:\s*true/);
});

test('CSpell knows the zizmor tool name', () => {
  assert.ok(spell.words.includes('zizmor'));
});

// Intentionally RED until workflow hardening is implemented.
void root;
