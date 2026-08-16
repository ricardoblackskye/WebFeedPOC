import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../../', import.meta.url);
const mainPath = new URL('src/main.jsx', root);
const entryServerPath = new URL('src/entry-server.jsx', root);
const appPath = new URL('src/App.jsx', root);
const pageComponentPath = new URL('src/pages/ArchitecturePage.jsx', root);
const pageStylePath = new URL('src/pages/ArchitecturePage.css', root);

function readRequired(url) {
  assert.ok(existsSync(url), `expected ${url.pathname} to exist`);
  return readFileSync(url, 'utf8');
}

test('ArchitecturePage component and stylesheet exist', () => {
  assert.ok(existsSync(pageComponentPath), 'src/pages/ArchitecturePage.jsx must exist');
  assert.ok(existsSync(pageStylePath), 'src/pages/ArchitecturePage.css must exist');
});

test('Client router registers /architecture route', () => {
  const mainCode = readRequired(mainPath);
  assert.match(
    mainCode,
    /<Route\s+path=["']architecture["']\s+element=\{<ArchitecturePage\s*\/>\}\s*\/>/,
    'expected /architecture route registered in src/main.jsx',
  );
  assert.match(
    mainCode,
    /import\s+ArchitecturePage\s+from\s+['"]\.\/pages\/ArchitecturePage(\.jsx)?['"]/,
    'expected ArchitecturePage imported in src/main.jsx',
  );
});

test('SSR server entry registers /architecture route for prerendering', () => {
  const serverCode = readRequired(entryServerPath);
  assert.match(
    serverCode,
    /<Route\s+path=["']architecture["']\s+element=\{<ArchitecturePage\s*\/>\}\s*\/>/,
    'expected /architecture route registered in src/entry-server.jsx',
  );
  assert.match(
    serverCode,
    /import\s+ArchitecturePage\s+from\s+['"]\.\/pages\/ArchitecturePage(\.jsx)?['"]/,
    'expected ArchitecturePage imported in src/entry-server.jsx',
  );
});

test('App navigation includes link to Architecture page', () => {
  const appCode = readRequired(appPath);
  assert.match(
    appCode,
    /<Link\s+to=["']\/architecture["']>\s*Architecture\s*<\/Link>/i,
    'expected Architecture navigation link in src/App.jsx',
  );
});

test('ArchitecturePage imports raw ARCHITECTURE.md at build time', () => {
  const pageCode = readRequired(pageComponentPath);
  assert.match(
    pageCode,
    /import\s+\w+\s+from\s+['"].*ARCHITECTURE\.md\?raw['"]/,
    'expected build-time raw markdown import in ArchitecturePage.jsx',
  );
});
