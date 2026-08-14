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
    /(?:actions\/cache(?:\/restore|\/save)?|free-disk-space|docker system prune|larger runner|larger-runner)/i,
  );
});

test('cached scanner databases are isolated and versioned when a cache strategy is used', () => {
  assert.match(workflow, /(?:trivy|grype).*\.cache|\.cache.*(?:trivy|grype)/is);
  assert.match(
    workflow,
    /(?:trivy|grype).*(?:version|hashFiles|key)|(?:version|hashFiles|key).*(?:trivy|grype)/is,
  );
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
