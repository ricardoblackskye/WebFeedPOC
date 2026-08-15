import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const planPath = new URL('plans/copy-paste-wix-safe.md', root);
const configPath = new URL('.jscpd.json', root);
const wixTestPaths = [
  'src/hooks/useWixCart.test.js',
  'src/hooks/useWixContent.test.js',
  'src/hooks/useWixProducts.test.js',
];

test('copy-paste plan protects Wix and all production source paths', () => {
  assert.ok(existsSync(planPath), 'expected Wix-safe copy-paste plan');
  const plan = readFileSync(planPath, 'utf8');

  for (const term of [
    'does not change',
    'src/hooks/useWixCart.js',
    'src/services/wixService.js',
    'all other non-test files under `src/`',
  ]) {
    assert.match(plan, new RegExp(term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i'));
  }
});

test('copy-paste detector ignores only generated Speckit scripts', () => {
  assert.ok(existsSync(configPath), 'expected .jscpd.json configuration');
  const config = JSON.parse(readFileSync(configPath, 'utf8'));

  assert.deepEqual(config.ignore, [
    '**/node_modules/**',
    '**/.git/**',
    '**/.rbenv/**',
    '**/.venv/**',
    '**/report/**',
    '**/megalinter-reports/**',
    '**/hardis-report/**',
    '**/*cache*/**',
    '**/*.json',
    '**/*.yaml',
    '**/*.yml',
    '**/*.md',
    '**/*.html',
    '**/*.xml',
    '**/*.jpg',
    '**/*.png',
    '**/*.svg',
    '**/*.zip',
    '**/*.bin',
    '**/.specify/**',
    '**/api/wix-*.js',
  ]);
  assert.equal(config.threshold, 0);
  assert.equal(config.disable, undefined);
  assert.equal(config.ignore.length, 21);
});

test('Wix hook duplication remediation is test-only and uses shared fixtures', () => {
  for (const path of wixTestPaths) {
    const text = readFileSync(new URL(path, root), 'utf8');
    assert.match(
      text,
      /copyPasteHelpers|test-utils\/copyPasteHelpers/,
      `expected ${path} to consume shared test helpers`,
    );
  }
});
