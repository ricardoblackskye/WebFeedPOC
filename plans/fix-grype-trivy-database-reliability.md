# Grype and Trivy database reliability plan

## Goal

Make the MegaLinter security-scanner job reliable when Grype and Trivy bootstrap their vulnerability databases, without hiding scanner failures or vulnerability findings.

## Evidence

Recent MegaLinter v10.0.0 runs with Grype v0.116.1 and Trivy v0.73.0 show:

- The GitHub-hosted runner warned that only 30 MB remained.
- Trivy downloaded its approximately 107 MB database but failed writing `/github/home/.cache/trivy/db/trivy.db` with `no space left on device`.
- Grype failed to activate its database with `database or disk is full (13)`.
- Grype then emitted `database does not exist`, which is a follow-on failure, not a vulnerability finding.

The earlier timeout-only mitigation in PR #58 is already merged but does not prevent the current disk-exhaustion failure. The stale branch `fix/grype-database-reliability` is behind `main` and is not being reused.

## TDD strategy

1. **RED:** add policy tests for the scanner reliability contract.
2. **Review gate:** publish the RED tests in a dedicated PR and obtain approval.
3. **GREEN:** implement only a supported CI/configuration change, selected after confirming MegaLinter's Docker/action boundaries.
4. **Verification:** rerun policy tests, application tests, build, and authoritative MegaLinter CI.

## RED contract

The tests will require:

- Both `REPOSITORY_GRYPE` and `REPOSITORY_TRIVY` to remain enabled and blocking.
- A pre-MegaLinter storage strategy that addresses the observed runner exhaustion, such as a supported cache/restore path or an explicit runner-space cleanup/larger-runner control.
- Scanner database paths to be isolated and versioned if cached, preventing a partial or incompatible database from being reused.
- No `DISABLE_LINTERS`, `DISABLE_ERRORS_LINTERS`, scanner-specific non-blocking setting, or broad ignore used to hide database failures.
- Documentation of how successful database initialization is distinguished from a vulnerability finding.

## Implementation investigation after approval

Investigate in this order:

1. A supported cache strategy for the MegaLinter container's `/github/home/.cache/trivy` and `/github/home/.cache/grype` paths, with versioned keys and no saving of failed/partial state.
2. A runner-space cleanup or larger-runner strategy if the action's container prevents safe cache injection.
3. A supported Trivy database mirror if registry/storage behavior contributes to the failure.
4. A narrowly scoped MegaLinter configuration change. Do not invent unsupported keys.

The implementation must not modify scanner findings, lower blocking behavior, or claim a clean scan when database initialization failed.

## Acceptance criteria

- Grype initializes without `database or disk is full` or `database does not exist`.
- Trivy initializes without `no space left on device` or `DB_DOWNLOAD_FAILED`.
- Actual findings, if any, remain visible and are triaged separately.
- Full MegaLinter CI is rerun with current scanner output.
- No broad disablement or blanket error suppression is introduced.
- The chosen cache/mirror/runner approach is documented and reproducible.

Related issue: #67. This work is intentionally separate from closed issue #51.

## Execution handoff

Stop after RED tests are pushed and obtain approval before implementation.
