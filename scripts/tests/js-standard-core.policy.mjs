import test from 'node:test';
import assert from 'node:assert/strict';
import { execSync } from 'node:child_process';
import { existsSync } from 'node:fs';

const root = new URL('../../', import.meta.url);

// Core files in scope for JS Standard remediation (#91).
// Excluded by design: api/wix-*.js, src/hooks/useWix*.js, src/services/wix*,
// src/services/stripeService*.js (third-party SDK glue and Stripe integration).
const CORE_FILES = [
  'e2e/about.spec.js',
  'e2e/helpers.js',
  'e2e/product-page.spec.js',
  'src/security/reactRouterSecurity.test.js',
  'src/test-setup.ts',
  'src/utils/helpers.js',
  'src/utils/structuredData.js',
  'src/utils/structuredData.test.js',
  'src/utils/helpers.test.js',
  'vite.config.js',
];

// Files that MUST remain excluded (policy guard)
const EXCLUDED_PREFIXES = [
  'api/wix-',
  'src/hooks/useWix',
  'src/services/wix',
  'src/services/stripeService',
];

test('all core files exist and are under version control', () => {
  for (const file of CORE_FILES) {
    const fullPath = new URL(file, root);
    assert.ok(
      existsSync(fullPath),
      `expected core file ${file} to exist`,
    );
  }
});

test('excluded files are not accidentally included in core set', () => {
  for (const file of CORE_FILES) {
    for (const prefix of EXCLUDED_PREFIXES) {
      assert.ok(
        !file.startsWith(prefix),
        `core file "${file}" starts with excluded prefix "${prefix}" — remove it from CORE_FILES`,
      );
    }
  }
});

test('standard passes with zero errors on core files', () => {
  const fileArgs = CORE_FILES.map((f) => new URL(f, root).pathname).join(' ');
  try {
    execSync(`npx standard ${fileArgs}`, {
      cwd: root,
      encoding: 'utf8',
      stdio: 'pipe',
      timeout: 60_000,
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
      `standard found violations on core files:\n${violations || combined.slice(0, 2000)}`,
    );
  }
});