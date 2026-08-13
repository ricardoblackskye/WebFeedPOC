import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const manifests = [
  new URL('.specify/integrations/speckit.manifest.json', root),
  new URL('.specify/integrations/copilot.manifest.json', root),
];

test('Speckit manifest integrity values remain hashes, not removed placeholders', () => {
  for (const url of manifests) {
    const text = readFileSync(url, 'utf8');
    const values = [...text.matchAll(/[0-9a-f]{64}/gi)].map((match) => match[0]);
    assert.ok(values.length > 0, `expected integrity hashes in ${url.pathname}`);
    for (const value of values) assert.match(value, /^[0-9a-f]{64}$/i);
  }
});

test('DevSkim remediation is narrowly scoped to the known false positive', () => {
  const config = JSON.parse(readFileSync(new URL('.devskim.json', root), 'utf8'));
  assert.deepEqual(config.suppressions, [
    { ruleId: 'DS173237', paths: ['.specify/integrations/*.manifest.json'] },
  ]);
});

// Intentionally RED until the narrow DevSkim policy is added.
void root;
