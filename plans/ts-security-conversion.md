# TS-Security: Convert Security Test File to TypeScript

**Issue:** [#127](https://github.com/ricardoblackskye/WebFeedPOC/issues/127)
**Branch:** `ts/127-security-conversion`
**Epic:** [#122](https://github.com/ricardoblackskye/WebFeedPOC/issues/122) — JS → TypeScript Migration

## Scope

Convert 1 security test file from JavaScript to TypeScript.

| Current | Target | Change |
|---------|--------|--------|
| `src/security/reactRouterSecurity.test.js` | `src/security/reactRouterSecurity.test.ts` | Add type annotations for all functions and data structures |

### Files to delete after conversion
- `src/security/reactRouterSecurity.test.js`

## Phase 1.5 — MegaLinter Pre-Flight ✅

| Check | Status |
|-------|--------|
| MegaLinter on `main` | ✅ Green (last completed run) |
| `npx tsc --noEmit` | ✅ Clean (0 errors) |

Baseline is clean — no pre-existing lint debt.

## Phase 2 — Conversion Details

### Types to define

#### `VersionRange` interface
```typescript
interface VersionRange {
  minimum: number[]
  maximumExclusive: number[]
}
```

#### `AffectedRanges` dictionary type
```typescript
interface AffectedRanges {
  [key: string]: VersionRange
}
```

#### `PackageLock` shape (minimal — only what we access)
```typescript
interface PackageLock {
  packages: {
    [packagePath: string]: {
      version?: string
    }
  }
}
```

### Function signatures to add

| Function | Signature |
|----------|-----------|
| `parseVersion` | `(version: string): number[]` |
| `compareVersions` | `(left: number[], right: number[]): number` |
| `isAffected` | `(version: string, range: VersionRange): boolean` |
| `resolvedVersion` | `(packageName: string): string \| undefined` |

### Additional type annotations

- `readFileSync` calls — typed as `readFileSync(...): string`
- `JSON.parse(...)` — typed via `as PackageLock` for the lock file
- `AFFECTED_RANGES` — typed as `AffectedRanges`
- The `match.slice(1).map(Number)` chain — already correctly typed once the return types are annotated

### Exports

Keep the same exports with typed versions:
```typescript
export { AFFECTED_RANGES, compareVersions, isAffected, parseVersion }
```

### Behaviour preserved

- No test logic changes
- Same assertions
- Same file reads (package.json, package-lock.json, src/main.jsx)
- `packageLock.packages[\`node_modules/${packageName}\`]?.version` — dynamic key access typed via `PackageLock` interface

## Phase 3 — User Approval Gate

**Report:** Baseline is GREEN. After TS conversion, the `.ts` file will be functionally equivalent. No RED phase possible for a pure-conversion task.

**Ask:** Proceed with creating the `.ts` file and deleting the `.js` original?

## Phase 4 — Implementation

1. Create `src/security/reactRouterSecurity.test.ts` with proper interfaces and type annotations
2. Run full suite → verify all 196+ tests still GREEN
3. Delete `src/security/reactRouterSecurity.test.js`
4. Run full suite → verify still GREEN
5. Run `npx tsc --noEmit` → verify clean

## Phase 4.5 — MegaLinter Post-Verification

6. Verify MegaLinter still clean
7. Run `npx cspell` on converted file
8. Commit + push + PR

## Verification Commands

```bash
npx vitest run              # all tests green
npx tsc --noEmit           # type-check clean
npm run build               # production build passes
npx cspell "src/security/reactRouterSecurity.test.ts"
```

## Risks / Edge Cases

- `packageLock.packages` uses dynamic string key (`node_modules/${packageName}`) — TS needs index signature on the `packages` type
- `Object.values(AFFECTED_RANGES).some(...)` — needs proper typing on `AFFECTED_RANGES` to avoid `any` inference
- `match.slice(1).map(Number)` — correct TS inference when function return type is declared as `number[]`
- `as PackageLock` cast on the lock file parse is safe since the shape is well-known at this point