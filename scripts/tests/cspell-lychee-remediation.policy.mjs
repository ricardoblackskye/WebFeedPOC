import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const cspellConfigPath = new URL('cspell.json', root);
const lycheeIgnorePath = new URL('.lycheeignore', root);
const megaLinterConfigPath = new URL('.mega-linter.yml', root);

function readRequired(url) {
  assert.ok(existsSync(url), `expected ${url.pathname} to exist`);
  return readFileSync(url, 'utf8');
}

const EXPECTED_WORDS = [
  'antiquesmarketplace',
  'Anytown',
  'apos',
  'artipacked',
  'autom',
  'behaviour',
  'browsable',
  'CHAND',
  'colours',
  'Customise',
  'exploitability',
  'ghsa',
  'GHSA',
  'giannadart',
  'Groot',
  'helmignore',
  'insightsengineering',
  'kubeconfig',
  'Lato',
  'lycheeignore',
  'mindmap',
  'njsproj',
  'ntvs',
  'packrat',
  'parallelizable',
  'prerendering',
  'pycache',
  'qwww',
  'refetches',
  'renv',
  'Replogle',
  'rgba',
  'rlib',
  'Rproj',
  'Ruserdata',
  'swiftpm',
  'tanstack',
  'taskstoissues',
  'TELE',
  'terraformignore',
  'tfstate',
  'tfvars',
  'TKTK',
  'touchpoints',
  'Underspecification',
  'underspecified',
  'vercel',
  'viewports',
  'vite',
  'vitest',
  'xyzzy',
  'yoursite',
];

test('cspell.json contains all repository, domain, technical, and template terms', () => {
  const cspell = JSON.parse(readRequired(cspellConfigPath));
  assert.ok(Array.isArray(cspell.words), 'expected cspell.words to be an array');

  for (const word of EXPECTED_WORDS) {
    assert.ok(
      cspell.words.includes(word),
      `expected cspell.words to include "${word}"`,
    );
  }
});

test('cspell.json configures ignorePaths for transient MegaLinter reports and artifacts', () => {
  const cspell = JSON.parse(readRequired(cspellConfigPath));
  assert.ok(Array.isArray(cspell.ignorePaths), 'expected cspell.ignorePaths to be an array');
  assert.ok(
    cspell.ignorePaths.some((p) => p.includes('megalinter-reports')),
    'expected cspell.ignorePaths to include megalinter-reports',
  );
});

test('.lycheeignore exists and defines narrow exclusions for private CI URLs and placeholders', () => {
  const lycheeIgnore = readRequired(lycheeIgnorePath);

  // Private GitHub URLs that 404 for unauthenticated CI requests
  assert.match(
    lycheeIgnore,
    /https:\/\/github\.com\/ricardoblackskye\/WebFeedPOC\/(actions|issues)\//,
    'expected .lycheeignore to exclude private repository action/issue links',
  );

  // Placeholder vendor and test domains
  assert.match(
    lycheeIgnore,
    /yoursite\.wix\.com/,
    'expected .lycheeignore to exclude yoursite.wix.com placeholder',
  );
  assert.match(
    lycheeIgnore,
    /antiquesmarketplace\.co\.uk/,
    'expected .lycheeignore to exclude antiquesmarketplace.co.uk placeholder domain',
  );

  // Root-relative static svg resolution in local file mode
  assert.match(
    lycheeIgnore,
    /\/vite\.svg/,
    'expected .lycheeignore to exclude root-relative /vite.svg',
  );
});

test('MegaLinter does not disable SPELL_CSPELL or SPELL_LYCHEE linters', () => {
  const megaLinterConfig = readRequired(megaLinterConfigPath);
  assert.doesNotMatch(
    megaLinterConfig,
    /DISABLE_LINTERS:\s*\[?.*\b(SPELL_CSPELL|SPELL_LYCHEE)\b.*\]?/,
    'SPELL_CSPELL and SPELL_LYCHEE must remain active',
  );
});

test('Primary application paths under src/ remain monitored without CSpell or Lychee ignores', () => {
  const cspell = JSON.parse(readRequired(cspellConfigPath));
  if (cspell.ignorePaths) {
    assert.ok(
      !cspell.ignorePaths.some((p) => p.startsWith('src/') || p.startsWith('**/src/')),
      'cspell ignorePaths must not ignore src/',
    );
  }

  if (existsSync(lycheeIgnorePath)) {
    const lycheeIgnore = readFileSync(lycheeIgnorePath, 'utf8');
    assert.doesNotMatch(
      lycheeIgnore,
      /(^|\n)src\//,
      '.lycheeignore must not broadly ignore src/',
    );
  }
});

test('.mega-linter.yml configures SPELL_LYCHEE_ARGUMENTS with --root-dir so root-relative links resolve', () => {
  const megaLinterConfig = readRequired(megaLinterConfigPath);
  assert.match(
    megaLinterConfig,
    /SPELL_LYCHEE_ARGUMENTS:\s*.*--root-dir/,
    'expected .mega-linter.yml to configure SPELL_LYCHEE_ARGUMENTS with --root-dir so lychee can resolve root-relative links',
  );
});

test('.mega-linter.yml excludes package-lock.json from lychee via SPELL_LYCHEE_FILTER_REGEX_EXCLUDE', () => {
  const megaLinterConfig = readRequired(megaLinterConfigPath);
  assert.match(
    megaLinterConfig,
    /SPELL_LYCHEE_FILTER_REGEX_EXCLUDE:\s*"\(package-lock\\.json\)"/,
    'expected .mega-linter.yml to exclude package-lock.json from lychee scanning',
  );
});
