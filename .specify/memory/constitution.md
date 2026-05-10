<!--
SYNC IMPACT REPORT
==================
Version change: (none) → 1.0.0 (initial ratification)
Added sections:
  - Core Principles (6 principles)
  - Technology Constraints
  - Development Workflow
  - Governance
Templates checked:
  - .specify/templates/plan-template.md ✅ Constitution Check gate present; aligns with principles
  - .specify/templates/spec-template.md ✅ User story / acceptance criteria structure compatible
  - .specify/templates/tasks-template.md ✅ Phase structure compatible; test task guidance retained
Deferred TODOs: none
-->

# Antiques Marketplace Constitution

## Core Principles

### I. Layered Architecture (NON-NEGOTIABLE)

All code MUST follow the three-layer pattern: `services/` → `hooks/` → components.
- Service files (`services/*.js`) own all external API communication — Wix SDK
  calls, Vercel serverless proxy calls, localStorage fallback logic.
- Custom hooks (`hooks/use*.js`) own state management, loading/error states,
  and compose one or more services. They MUST NOT render JSX.
- React components (`components/`, `pages/`) consume hooks only. Components
  MUST NOT import from `services/` directly.
- Serverless functions in `api/` are thin proxies: validate input, call Wix SDK,
  return result. No business logic lives in `api/`.

### II. Wix-Only Commerce

Wix eCommerce is the single source of truth for all product, cart, checkout,
and order data. No alternative commerce backend, payment processor, or product
database MUST be introduced.
- Stripe integration is deprecated and MUST NOT be extended. All new payment
  flows go through Wix Checkout.
- Cart state MUST sync to Wix via `wixCartService.js`. The localStorage fallback
  is a resilience mechanism only — it MUST never be promoted to primary storage.
- All Wix credentials (`WIX_API_KEY`, `WIX_CLIENT_ID`) MUST reside in Vercel
  environment variables. They MUST NOT appear in any `VITE_`-prefixed variable
  or in any client-side bundle.

### III. Test Coverage Standards (NON-NEGOTIABLE)

Every code change MUST maintain or improve the following coverage floors,
enforced by `npm run test:coverage` (Vitest v8):
- Components: ≥ 80%
- Hooks: ≥ 85%
- Services: ≥ 90%
- Utilities (`utils/`): 100%

Every new service function MUST have a corresponding test in a `.test.js` file
in the same directory. Every new component MUST have a `.test.jsx` counterpart.
Tests use Vitest + React Testing Library exclusively — Jest and Enzyme are
prohibited. E2E tests (Playwright, `e2e/`) MUST cover all critical user journeys:
browse, filter, product detail, add to cart, and checkout redirect.

### IV. SSR Compatibility

The application supports server-side rendering via `entry-server.jsx` (Vite SSR).
All code MUST be SSR-safe:
- `window`, `document`, and `localStorage` MUST only be accessed inside
  `useEffect` hooks or guarded by `typeof window !== 'undefined'`.
- Third-party packages that require browser globals MUST be listed in
  `vite.config.js` under `ssr.noExternal`.
- No dynamic `import()` of browser-only modules at module evaluation time.

### V. Security (OWASP Top 10 Compliance)

- **A01 Broken Access Control**: Serverless functions MUST validate that requests
  originate from authorised origins. CORS headers MUST whitelist only known
  domains.
- **A03 Injection**: All parameters received by `api/` functions MUST be
  validated and sanitised before passing to the Wix SDK. No raw string
  concatenation into API calls.
- **A05 Security Misconfiguration**: No secrets in source control. `.env` is
  for local development only and is excluded from git via `.gitignore`.
- **A06 Vulnerable Components**: `npm audit` MUST report zero high-severity
  vulnerabilities before any production deployment.
- **DOM XSS**: `dangerouslySetInnerHTML` is prohibited. All dynamic content
  MUST be rendered through React's standard JSX interpolation.

### VI. Accessibility — WCAG 2.1 AA

All UI changes MUST meet WCAG 2.1 Level AA:
- Every interactive element (buttons, links, modals, cart controls) MUST be
  keyboard-navigable and have a descriptive `aria-label` or visible text label.
- Colour contrast ratio MUST be ≥ 4.5:1 for normal text, ≥ 3:1 for large text
  (gold accent palette must be validated against backgrounds).
- Images MUST have meaningful `alt` text; decorative images use `alt=""`.
- Modal dialogs MUST trap focus and restore it on close.
- Stock indicator states (in-stock / low-stock / out-of-stock) MUST be conveyed
  by more than colour alone (text label or icon with aria description).

## Technology Constraints

The following stack is fixed. Introducing alternatives requires a constitution
amendment:

| Layer | Mandated technology |
|---|---|
| Frontend framework | React 18, functional components + hooks only |
| Build tooling | Vite (no webpack, CRA, or Parcel) |
| Routing | react-router-dom v7, `<Outlet>` pattern |
| Styling | Bespoke CSS (EB Garamond + Lato, gold accent palette). No Tailwind, MUI, Chakra, or other CSS frameworks. |
| Commerce | Wix eCommerce SDK |
| Testing (unit) | Vitest + React Testing Library |
| Testing (e2e) | Playwright |
| Hosting | Vercel (static SPA + serverless functions) |
| Language | JavaScript (ES Next). TypeScript MUST NOT be introduced without a constitution amendment. |

Performance target: Largest Contentful Paint < 2.5 s on the product listing page
on a simulated mid-range mobile device.

## Development Workflow

1. Features are spec'd before implementation using spec-kit phases in order:
   constitution → specify → clarify → plan → tasks → implement.
2. `npm test` MUST pass before every commit. The CI gate on `main` MUST stay
   green.
3. Any change to an `api/` function MUST include a corresponding update to
   `WIX-API-INTEGRATION.md`.
4. Architecture changes MUST be reflected in `ARCHITECTURE.md` (C4 diagrams).
5. Secrets are managed in Vercel dashboard environment variables. `.env` is
   for local development only and MUST NOT be committed.
6. `npm audit` MUST show zero high-severity vulnerabilities before merging to
   `main`.

## Governance

This constitution supersedes all other documented practices for this project.
Amendments require:
1. A written rationale explaining the change and which principle is affected.
2. Updating this document with an incremented version number following semantic
   versioning (MAJOR: principle removal/redefinition; MINOR: new principle/section;
   PATCH: clarification or wording fix).
3. Updating any affected templates in `.specify/templates/` to reflect the change.
4. All open specs and plans in progress MUST be reviewed for drift against the
   amended constitution before implementation continues.

All `/speckit.plan` executions MUST include a Constitution Check gate that
validates the proposed design against the six principles above before proceeding.

**Version**: 1.0.0 | **Ratified**: 2026-05-10 | **Last Amended**: 2026-05-10
