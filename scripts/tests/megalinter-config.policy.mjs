import test from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';

const root = new URL('../..', import.meta.url);
const workflowPath = new URL('.github/workflows/mega-linter.yml', root);
const configPath = new URL('.mega-linter.yml', root);

function readRequired(url) {
  assert.ok(existsSync(url), `expected ${url.pathname} to exist`);
  return readFileSync(url, 'utf8');
}

test('MegaLinter workflow runs on pushes and pull requests targeting main', () => {
  const workflow = readRequired(workflowPath);
  assert.match(workflow, /push:/);
  assert.match(workflow, /pull_request:/);
  assert.match(workflow, /branches:\s*\n\s*-?\s*main/);
});

test('MegaLinter uses current pinned major actions without source write access', () => {
  const workflow = readRequired(workflowPath);
  assert.match(workflow, /oxsecurity\/megalinter@v10/);
  assert.match(workflow, /actions\/checkout@v6/);
  assert.match(workflow, /actions\/upload-artifact@v7/);
  assert.match(workflow, /contents:\s*read/);
  assert.doesNotMatch(workflow, /contents:\s*write/);
});

test('MegaLinter preserves authenticated git access for private-repository diff validation', () => {
  const workflow = readRequired(workflowPath);
  assert.match(
    workflow,
    /persist-credentials:\s*true/,
    'private repositories need checkout credentials for MegaLinter git diff/fetch operations',
  );
});

test('MegaLinter does not enable automatic fixes', () => {
  const workflow = readRequired(workflowPath);
  const config = readRequired(configPath);
  assert.doesNotMatch(workflow, /APPLY_FIXES\s*:/);
  assert.doesNotMatch(config, /APPLY_FIXES\s*:/);
});

test('MegaLinter passes the GitHub token and uploads reports after failures', () => {
  const workflow = readRequired(workflowPath);
  assert.match(workflow, /GITHUB_TOKEN:\s*\$\{\{\s*secrets\.GITHUB_TOKEN\s*\}\}/);
  assert.match(workflow, /if:\s*success\(\)\s*\|\|\s*failure\(\)/);
  assert.match(workflow, /megalinter-reports/);
  assert.match(workflow, /mega-linter\.log/);
});

test('MegaLinter configuration ignores gitignored files and generated output', () => {
  const config = readRequired(configPath);
  assert.match(config, /IGNORE_GITIGNORED_FILES:\s*true/);
  for (const directory of ['node_modules', 'dist', 'dist-ssr', 'coverage', 'playwright-report', 'test-results']) {
    assert.match(config, new RegExp(directory), `expected ${directory} to be excluded`);
  }
});

test('MegaLinter validates the complete codebase on main pushes', () => {
  const workflow = readRequired(workflowPath);
  assert.match(workflow, /VALIDATE_ALL_CODEBASE:/);
  assert.match(workflow, /github\.event_name\s*==\s*['"]push['"]/);
  assert.match(workflow, /refs\/heads\/main/);
});

// This is deliberately a policy test: it should fail RED until the workflow
// and configuration are implemented.
void root;
