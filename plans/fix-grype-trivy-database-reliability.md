# Grype and Trivy database reliability plan

## Goal

Make the MegaLinter security-scanner job reliable when Grype and Trivy bootstrap their vulnerability databases, without hiding scanner failures or vulnerability findings.

## Evidence

Recent MegaLinter v10.0.0 runs with Grype v0.116.1 and Trivy v0.73.0 showed the GitHub-hosted runner running out of disk space while the scanners initialized their databases. Trivy failed writing its database with `no space left on device`; Grype then reported database activation and missing-database errors. The latter is a follow-on bootstrap failure, not a vulnerability finding.

## TDD strategy

1. **RED:** add policy tests for the scanner-reliability contract.
2. **Review gate:** publish the RED tests and plan in a dedicated review PR.
3. **GREEN:** implement only a supported CI/configuration change after approval.
4. **Verification:** rerun policy tests, application tests, build, and authoritative MegaLinter CI.

## RED contract

The tests require:

- An explicit pre-MegaLinter storage strategy that addresses runner exhaustion.
- Isolated, versioned Grype and Trivy cache paths when caching is used.
- Both scanners to remain enabled and blocking.
- No `DISABLE_LINTERS`, `DISABLE_ERRORS_LINTERS`, scanner-specific non-blocking setting, or broad ignore used to hide database failures.
- Documentation of how successful database initialization is distinguished from a vulnerability finding.

## Selected implementation

The workflow reclaims runner disk space before the Docker-based MegaLinter action
using the maintained `insightsengineering/disk-space-reclaimer` action pinned to
commit `dae9fabcb8febe09f6585471948acf9dc9a57489`. It removes disposable
preinstalled SDKs, packages, Docker images, swap storage, and the runner tool
cache. It does not cache scanner databases, so no partial database can be
restored or saved under an unversioned key.

Grype and Trivy remain enabled and blocking through MegaLinter's defaults. A
successful database initialization is required before scanner output can be
treated as vulnerability findings; messages such as `no space left on device`,
`database or disk is full`, or `database does not exist` remain infrastructure
failures and must fail CI rather than being suppressed.

## Acceptance criteria

- Grype and Trivy initialize without disk/database bootstrap errors.
- Actual vulnerability findings remain visible and blocking.
- Full MegaLinter CI is rerun with current scanner output.
- No broad disablement or blanket error suppression is introduced.
- The chosen storage strategy is documented and reproducible.

Related issue: #67. This work is intentionally separate from closed issue #51.

## Execution handoff

Stop after RED tests are committed and obtain approval before implementation.
