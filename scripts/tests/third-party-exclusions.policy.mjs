import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const megaLinterConfigPath = new URL('.mega-linter.yml', root);
const jscpdConfigPath = new URL('.jscpd.json', root);
const packageJsonPath = new URL('package.json', root);

function readRequired(url) {
  assert.ok(existsSync(url), `expected ${url.pathname} to exist`);
  return readFileSync(url, 'utf8');
}

test('MegaLinter configuration excludes .specify directory and sets filter exclude regex', () => {
  const config = readRequired(megaLinterConfigPath);

  // Check ADDITIONAL_EXCLUDED_DIRECTORIES has .specify
  assert.match(
    config,
    /ADDITIONAL_EXCLUDED_DIRECTORIES:[\s\S]*-\s*\.specify\b/,
    'expected .specify in ADDITIONAL_EXCLUDED_DIRECTORIES',
  );

  // Check FILTER_REGEX_EXCLUDE includes .specify
  assert.match(
    config,
    /FILTER_REGEX_EXCLUDE:.*\.specify/,
    'expected FILTER_REGEX_EXCLUDE to include .specify',
  );
});

test('jscpd configuration ignores .specify and api/wix-*.js with strict threshold 0', () => {
  const jscpd = JSON.parse(readRequired(jscpdConfigPath));

  assert.equal(jscpd.threshold, 0, 'jscpd threshold must remain strictly 0');
  assert.ok(Array.isArray(jscpd.ignore), 'jscpd ignore must be an array');

  assert.ok(
    jscpd.ignore.includes('**/.specify/**'),
    'expected jscpd.ignore to include "**/.specify/**"',
  );
  assert.ok(
    jscpd.ignore.includes('**/api/wix-*.js') || jscpd.ignore.includes('api/wix-*.js'),
    'expected jscpd.ignore to include "**/api/wix-*.js"',
  );
});

test('package.json configures Standard JS to ignore third-party and vendor assets', () => {
  const pkg = JSON.parse(readRequired(packageJsonPath));

  assert.ok(pkg.standard, 'expected standard configuration in package.json');
  assert.ok(Array.isArray(pkg.standard.ignore), 'expected standard.ignore to be an array');

  const ignores = pkg.standard.ignore;
  assert.ok(
    ignores.includes('api/wix-*.js') || ignores.includes('api/**'),
    'expected standard to ignore api/wix-*.js',
  );
  assert.ok(
    ignores.includes('.specify/**') || ignores.includes('.specify'),
    'expected standard to ignore .specify/**',
  );
});

test('primary application source paths under src/ remain protected and monitored', () => {
  const config = readRequired(megaLinterConfigPath);
  const jscpd = JSON.parse(readRequired(jscpdConfigPath));
  const pkg = JSON.parse(readRequired(packageJsonPath));

  assert.doesNotMatch(config, /ADDITIONAL_EXCLUDED_DIRECTORIES:[\s\S]*-\s*src\b/);
  assert.ok(
    !jscpd.ignore.some((p) => p.startsWith('src/') || p.startsWith('**/src/**')),
    'jscpd must not broadly ignore src/',
  );
  if (pkg.standard?.ignore) {
    assert.ok(
      !pkg.standard.ignore.some((p) => p.startsWith('src/') || p.startsWith('src/**')),
      'Standard JS must not ignore src/',
    );
  }
});
