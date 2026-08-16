import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const categoryFilterCssPath = new URL('src/components/CategoryFilter.css', root);
const sortControlsCssPath = new URL('src/components/SortControls.css', root);

function readRequired(url) {
  assert.ok(existsSync(url), `expected ${url.pathname} to exist`);
  return readFileSync(url, 'utf8');
}

test('CategoryFilter title does not use hardcoded white text and defines readable dark text', () => {
  const css = readRequired(categoryFilterCssPath);
  const titleBlockMatch = css.match(/\.category-filter-title\s*\{([^}]+)\}/);
  assert.ok(titleBlockMatch, 'expected .category-filter-title rule block');
  const titleBlock = titleBlockMatch[1];

  assert.doesNotMatch(
    titleBlock,
    /color:\s*rgb\(255\s+255\s+255/,
    'expected .category-filter-title to not use hardcoded white text',
  );
  assert.doesNotMatch(
    titleBlock,
    /color:\s*white\b/,
    'expected .category-filter-title to not use white keyword',
  );
  assert.match(
    titleBlock,
    /color:\s*(#2c2416|inherit|rgb\(44\s+36\s+22|\bvar\(--color-text\b)/,
    'expected .category-filter-title to define dark/theme text color',
  );
});

test('CategoryFilter button (inactive state) does not use hardcoded white text and defines readable dark text', () => {
  const css = readRequired(categoryFilterCssPath);
  const btnBlockMatch = css.match(/\.category-btn\s*\{([^}]+)\}/);
  assert.ok(btnBlockMatch, 'expected .category-btn rule block');
  const btnBlock = btnBlockMatch[1];

  assert.doesNotMatch(
    btnBlock,
    /color:\s*rgb\(255\s+255\s+255/,
    'expected .category-btn to not use hardcoded white text',
  );
  assert.doesNotMatch(
    btnBlock,
    /color:\s*white\b/,
    'expected .category-btn to not use white keyword',
  );
  assert.match(
    btnBlock,
    /color:\s*(#2c2416|inherit|rgb\(44\s+36\s+22|\bvar\(--color-text\b)/,
    'expected .category-btn to define dark/theme text color',
  );
});

test('CategoryFilter active button retains clear high contrast with gold background', () => {
  const css = readRequired(categoryFilterCssPath);
  const activeBtnMatch = css.match(/\.category-btn\.active\s*\{([^}]+)\}/);
  assert.ok(activeBtnMatch, 'expected .category-btn.active rule block');
  const activeBlock = activeBtnMatch[1];

  assert.match(
    activeBlock,
    /background:\s*var\(--color-gold\)/,
    'expected .category-btn.active to have gold background',
  );
  assert.match(
    activeBlock,
    /color:\s*(#1a1a1a|#000|#2c2416)/,
    'expected .category-btn.active to have high-contrast dark text on gold',
  );
});

test('SortControls sort-label does not use hardcoded white text and defines readable dark text', () => {
  const css = readRequired(sortControlsCssPath);
  const sortLabelMatch = css.match(/\.sort-label\s*\{([^}]+)\}/);
  assert.ok(sortLabelMatch, 'expected .sort-label rule block');
  const sortLabelBlock = sortLabelMatch[1];

  assert.doesNotMatch(
    sortLabelBlock,
    /color:\s*rgb\(255\s+255\s+255/,
    'expected .sort-label to not use hardcoded white text',
  );
  assert.doesNotMatch(
    sortLabelBlock,
    /color:\s*white\b/,
    'expected .sort-label to not use white keyword',
  );
  assert.match(
    sortLabelBlock,
    /color:\s*(#2c2416|inherit|rgb\(44\s+36\s+22|\bvar\(--color-text\b)/,
    'expected .sort-label to define dark/theme text color',
  );
});

test('SortControls search placeholder does not use white text', () => {
  const css = readRequired(sortControlsCssPath);
  const placeholderMatch = css.match(/\.search-input::placeholder\s*\{([^}]+)\}/);
  assert.ok(placeholderMatch, 'expected .search-input::placeholder rule block');
  const placeholderBlock = placeholderMatch[1];

  assert.doesNotMatch(
    placeholderBlock,
    /color:\s*rgb\(255\s+255\s+255/,
    'expected placeholder to not use white text',
  );
  assert.doesNotMatch(
    placeholderBlock,
    /color:\s*white\b/,
    'expected placeholder to not use white keyword',
  );
});
