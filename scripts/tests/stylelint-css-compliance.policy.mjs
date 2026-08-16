import test from 'node:test';
import assert from 'node:assert/strict';
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const root = new URL('../../', import.meta.url);
const srcDir = new URL('src/', root).pathname;

function getAllCssFiles(dir) {
  const results = [];
  const entries = readdirSync(dir);
  for (const entry of entries) {
    const fullPath = join(dir, entry);
    const stat = statSync(fullPath);
    if (stat.isDirectory()) {
      results.push(...getAllCssFiles(fullPath));
    } else if (entry.endsWith('.css')) {
      results.push(fullPath);
    }
  }
  return results;
}

const cssFiles = getAllCssFiles(srcDir);

test('repository discovers all application CSS stylesheets under src/', () => {
  assert.ok(cssFiles.length >= 14, `expected at least 14 CSS files, found ${cssFiles.length}`);
});

test('no stylesheets use legacy rgba or comma-separated rgb color syntax', () => {
  const legacyRgbaPattern = /rgba\s*\(/i;
  const legacyCommaRgbPattern = /rgb\s*\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*\)/i;

  const violations = [];
  for (const file of cssFiles) {
    const content = readFileSync(file, 'utf8');
    if (legacyRgbaPattern.test(content) || legacyCommaRgbPattern.test(content)) {
      violations.push(file);
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Found legacy color function syntax in: ${violations.join(', ')}`,
  );
});

test('no stylesheets use legacy min-width or max-width media query expressions', () => {
  const legacyMediaPattern = /@media\s*\([^)]*(?:max-width|min-width)\s*:/i;

  const violations = [];
  for (const file of cssFiles) {
    const content = readFileSync(file, 'utf8');
    if (legacyMediaPattern.test(content)) {
      violations.push(file);
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Found legacy media query range syntax in: ${violations.join(', ')}`,
  );
});

test('no stylesheets contain redundant 4-value box-model shorthand values', () => {
  // e.g. "margin: 1rem 0 2rem 0" where right == left, or "0 0 1.5rem 0"
  const redundantPattern = /(?:margin|padding)\s*:\s*([^\s;]+)\s+([^\s;]+)\s+([^\s;]+)\s+\2\s*;/i;

  const violations = [];
  for (const file of cssFiles) {
    const content = readFileSync(file, 'utf8');
    if (redundantPattern.test(content)) {
      violations.push(file);
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Found redundant shorthand values in: ${violations.join(', ')}`,
  );
});

test('no stylesheets use quoted unquoted-safe font names or non-kebab keyframes', () => {
  const quotedFontPattern = /font-family\s*:\s*["']Lato["']/i;
  const camelKeyframePattern = /@keyframes\s+(?:fadeIn|slideUp)\b|animation\s*:[^;]*(?:fadeIn|slideUp)\b/;

  const violations = [];
  for (const file of cssFiles) {
    const content = readFileSync(file, 'utf8');
    if (quotedFontPattern.test(content) || camelKeyframePattern.test(content)) {
      violations.push(file);
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Found quoted font names or non-kebab keyframes in: ${violations.join(', ')}`,
  );
});

test('no stylesheets use snake_case class selectors or deprecated word-break keyword', () => {
  const snakeClassPattern = /\.status-not_fulfilled\b/;
  const deprecatedWordBreakPattern = /word-break\s*:\s*break-word/i;

  const violations = [];
  for (const file of cssFiles) {
    const content = readFileSync(file, 'utf8');
    if (snakeClassPattern.test(content) || deprecatedWordBreakPattern.test(content)) {
      violations.push(file);
    }
  }

  assert.deepEqual(
    violations,
    [],
    `Found snake_case class selectors or deprecated word-break in: ${violations.join(', ')}`,
  );
});
