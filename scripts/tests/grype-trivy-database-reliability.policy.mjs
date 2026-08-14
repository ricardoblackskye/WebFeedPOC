import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';

const workflow = readFileSync(
  new URL('../../.github/workflows/mega-linter.yml', import.meta.url),
  'utf8',
);
const config = readFileSync(new URL('../../.mega-linter.yml', import.meta.url), 'utf8');
const policy = readFileSync(
  new URL('../../plans/fix-grype-trivy-database-reliability.md', import.meta.url),
  'utf8',
);

test('scanner database reliability has an explicit pre-MegaLinter storage strategy', () => {
  assert.match(
    workflow,
    /(?:actions\/cache(?:\/restore|\/save)?|free-disk-space|disk-space-reclaimer|docker system prune|larger runner|larger-runner)/i,
  );
});

test('the storage strategy is pinned and configured for scanner database headroom', () => {
  assert.match(workflow, /insightsengineering\/disk-space-reclaimer@(?:[0-9a-f]{40})/i);
  assert.match(
    workflow,
    /(?:android|dotnet|haskell|large-packages|docker-images|swap-storage|tools-cache):\s*true/is,
  );
});

test('the storage action runs before MegaLinter and preserves blocking scanner defaults', () => {
  const storageIndex = workflow.indexOf('insightsengineering/disk-space-reclaimer@');
  const megalinterIndex = workflow.indexOf('uses: oxsecurity/megalinter@');

  assert.ok(storageIndex >= 0 && storageIndex < megalinterIndex);
  assert.doesNotMatch(config, /REPOSITORY_(?:GRYPE|TRIVY)_IGNORE|REPOSITORY_(?:GRYPE|TRIVY)_DISABLE_ERRORS/);
});

test('scanner failures remain blocking and database bootstrap verification is documented', () => {
  assert.doesNotMatch(config, /DISABLE_LINTERS[^\n]*(?:REPOSITORY_GRYPE|REPOSITORY_TRIVY)/);
  assert.doesNotMatch(config, /DISABLE_ERRORS_LINTERS[^\n]*(?:REPOSITORY_GRYPE|REPOSITORY_TRIVY)/);
  assert.doesNotMatch(config, /REPOSITORY_(?:GRYPE|TRIVY)_DISABLE_ERRORS/);
  assert.match(policy, /successful database initialization/i);
  assert.match(
    workflow + config,
    /(?:database|cache).*(?:Grype|Trivy)|(?:Grype|Trivy).*(?:database|cache)/is,
  );
});
