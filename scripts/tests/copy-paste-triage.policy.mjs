import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);

test('copy-paste triage documents intentional and actionable clone groups', () => {
  const url = new URL('plans/copy-paste-triage.md', root);
  assert.ok(existsSync(url), 'expected copy-paste triage document');
  const text = readFileSync(url, 'utf8');
  for (const term of ['Speckit', 'generated', 'application', 'tests', 'CSS']) {
    assert.match(text, new RegExp(term, 'i'));
  }
});

test('copy-paste remediation extracts a shared test helper', () => {
  const url = new URL('src/test-utils/copyPasteHelpers.js', root);
  assert.ok(existsSync(url), 'expected shared test helper');
  assert.match(readFileSync(url, 'utf8'), /export/);
});

// Intentionally RED until triage documentation and the first safe extraction
// are implemented.
void root;
