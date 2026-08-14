import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const manifestPaths = [
  '.specify/integrations/speckit.manifest.json',
  '.specify/integrations/copilot.manifest.json',
];
const manifests = manifestPaths.map((path) => new URL(path, root));

test('Speckit manifest integrity values remain hashes, not removed placeholders', () => {
  for (const url of manifests) {
    const text = readFileSync(url, 'utf8');
    const values = [...text.matchAll(/[0-9a-f]{64}/gi)].map((match) => match[0]);

    assert.ok(values.length > 0, `expected integrity hashes in ${url.pathname}`);
    for (const value of values) assert.match(value, /^[0-9a-f]{64}$/i);
  }
});

test('DevSkim excludes only the two manifest paths containing false-positive hashes', () => {
  const config = JSON.parse(readFileSync(new URL('.devskim.json', root), 'utf8'));

  assert.deepEqual(
    config.Globs,
    ['**/.specify/integrations/*.manifest.json'],
    'DevSkim path exclusion must match only the two known manifest files recursively',
  );
});

test('DevSkim does not globally disable DS173237 while handling manifest hashes', () => {
  const config = JSON.parse(readFileSync(new URL('.devskim.json', root), 'utf8'));

  assert.equal(config.IgnoreRuleIds?.includes('DS173237') ?? false, false);
  assert.equal(config.LanguageRuleIgnoreMap?.json?.includes('DS173237') ?? false, false);
  assert.equal('suppressions' in config, false);
});
