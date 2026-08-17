import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const root = new URL('../../', import.meta.url);

// Files in scope for #95: test and config files with JS Standard violations
const SCOPED_FILES = [
  'playwright.config.cjs',
  'scripts/prerender.mjs',
  'scripts/tests/action-hardening.policy.mjs',
];

// Excluded prefixes (same as before)
const EXCLUDED_PREFIXES = [
  'api/wix-',
  'src/hooks/useWix',
  'src/services/wix',
  'src/services/stripeService',
];

test('all scoped files exist and are under version control', () => {
  for (const file of SCOPED_FILES) {
    const fullPath = new URL(file, root);
    assert.ok(
      existsSync(fullPath),
      `expected scoped file ${file} to exist`,
    );
  }
});

test('scoped files do not start with excluded prefixes', () => {
  for (const file of SCOPED_FILES) {
    for (const prefix of EXCLUDED_PREFIXES) {
      assert.ok(
        !file.startsWith(prefix),
        `scoped file "${file}" starts with excluded prefix "${prefix}" — this should not happen`,
      );
    }
  }
});

test('standard passes with zero errors on scoped files', () => {
  const fileArgs = SCOPED_FILES.map((f) => new URL(f, root).pathname).join(' ');
  try {
    execSync(`npx standard ${fileArgs}`, {
      cwd: root,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 30_000,
    });
  } catch (err) {
    // standard exits non-zero when violations found
    const output = err.stdout || '';
    const stderr = err.stderr || '';
    const combined = output + stderr;

    // Parse individual violations for a useful failure message
    const violations = combined
      .split('\n')
      .filter((line) => /^\s+\//.test(line) || line.includes('standard:'))
      .join('\n');

    assert.fail(
      `standard found violations on scoped files:\n${violations || combined.slice(0, 2000)}`,
    );
  }
});