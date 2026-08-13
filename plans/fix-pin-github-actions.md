# Pin GitHub Actions and Tighten CI Permissions Plan

> **For Hermes:** Follow strict TDD: write policy tests, verify RED, push them for review, then implement after approval.

**Goal:** Resolve zizmor's action-pinning, credential-persistence, and excessive-permissions findings in both GitHub Actions workflows.

**Architecture:** Keep the existing CI behavior while hardening workflow supply-chain and token boundaries. The ordinary test workflow receives read-only contents access and discards checkout credentials; MegaLinter retains checkout credentials because it inspects private repository history.

**Technical Strategy:** Replace mutable action tags with verified commit SHAs and version comments. Add explicit `permissions: contents: read` to `ci.yml`. Set `persist-credentials: false` in `ci.yml` and retain `true` in `mega-linter.yml`. Add `zizmor` to the CSpell dictionary.

**Testing Blueprint:** Add Node policy tests to assert immutable SHA references, least-privilege CI permissions, distinct checkout credential policies, and CSpell vocabulary. Run the policy tests RED before implementation, then GREEN plus Vitest/build.

## Tasks

1. Create `scripts/tests/action-hardening.policy.mjs` and run it RED.
2. Commit/push RED tests for review; stop for approval.
3. Pin actions and tighten permissions/credential persistence.
4. Add `zizmor` to `cspell.json`.
5. Run policy tests, Vitest, build, and inspect MegaLinter.

## Verified SHAs

- `actions/checkout@v4`: `11d5960a326750d5838078e36cf38b85af677262`
- `actions/checkout@v6`: `d23441a48e516b6c34aea4fa41551a30e30af803`
- `actions/setup-node@v4`: `49933ea5288caeca8642d1e84afbd3f7d6820020`
- `actions/upload-artifact@v7`: `043fb46d1a93c77aae656e7c1c64a875d1fc6a0a`
- `oxsecurity/megalinter@v10`: `15e5b45552097e318c93de385779ce3b1084052c`

## Acceptance criteria

- No zizmor `unpinned-uses` findings.
- No `artipacked` warning in `ci.yml`.
- No excessive-permissions warning in `ci.yml`.
- MegaLinter retains private Git history access.
- Existing tests/build pass.

Related issue: #60.

## Execution handoff

Stop after RED tests are pushed and obtain explicit approval before implementation.

---

## History review

MegaLinter previously required `persist-credentials: true` for private-repository Git diff inspection. This plan applies the opposite setting only to the normal test workflow, which has no downstream Git consumer.
