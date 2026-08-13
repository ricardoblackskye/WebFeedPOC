import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const cspellPath = new URL('cspell.json', root);
const packagePath = new URL('package.json', root);
const lockPath = new URL('package-lock.json', root);

function readRequired(url) {
  assert.ok(existsSync(url), `expected ${url.pathname} to exist`);
  return readFileSync(url, 'utf8');
}

test('repository CSpell configuration accepts project-specific names', () => {
  const config = JSON.parse(readRequired(cspellPath));
  assert.ok(Array.isArray(config.words));
  assert.ok(config.words.includes('ricardoblackskye'));
});

test('package manifest pins direct tooling to patched vulnerability-safe lines', () => {
  const manifest = JSON.parse(readRequired(packagePath));
  const dev = manifest.devDependencies;
  assert.ok(dev.vite && /^\^6\.4\.[3-9]\d*$/.test(dev.vite), `unexpected vite version: ${dev.vite}`);
  assert.ok(dev.vitest && /^\^3\./.test(dev.vitest), `unexpected vitest version: ${dev.vitest}`);
});

test('lockfile does not retain vulnerable lodash or uuid versions', () => {
  const lock = JSON.parse(readRequired(lockPath));
  const packages = lock.packages ?? {};
  const lodash = packages['node_modules/lodash'];
  const uuid = packages['node_modules/uuid'];
  assert.ok(!lodash || lodash.version !== '4.17.23');
  assert.ok(!uuid || uuid.version !== '10.0.0');
});

// These policy tests intentionally fail until the CSpell and dependency
// remediation implementation is added.
void root;
void lockPath;
void packagePath;
void cspellPath;
