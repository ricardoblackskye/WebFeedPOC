# Test Utilities Module

## Overview
`src/test-utils/` provides mock data generators, fixture factories, and strongly typed interfaces for unit and integration testing.

## Interface
- `createProductFixture(overrides)` in [`copyPasteHelpers.ts`](./copyPasteHelpers.ts): Generates mock product fixture conforming to `ProductFixture`.
- `createCartFixture(overrides)` in [`copyPasteHelpers.ts`](./copyPasteHelpers.ts): Generates mock cart fixture conforming to `CartFixture`.
- `createWixCartLineItemFixture(overrides)` in [`copyPasteHelpers.ts`](./copyPasteHelpers.ts): Generates mock Wix line item fixture.
- `createWixCartFixture(overrides)` in [`copyPasteHelpers.ts`](./copyPasteHelpers.ts): Generates mock Wix cart fixture.

## Invariants
- Fixture factories return reproducible default values while allowing partial overrides via generic typing.
- Test helpers produce isolated state without modifying global mock configurations.

## Side Effects
- None. Pure generator functions.

## Verification
- Run: `npm test`
