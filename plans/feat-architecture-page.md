# Architecture Documentation Page Plan (`/architecture`)

> Follow strict TDD: write policy tests and component unit tests, verify RED, push for review, then implement after approval.

**Related issue:** #87

## Goal

Create a dedicated documentation page at `/architecture` that displays the contents of `ARCHITECTURE.md`, rendering markdown headings, text, and tables alongside interactive/vector SVG charts for all 11 Mermaid diagrams using Mermaid.js loaded from CDN, with raw markdown imported at build time.

## Evidence & Context

`ARCHITECTURE.md` exists in the repository root and contains:
- 12 top-level sections documenting system overview, deployment, module maps, component trees, data flow, cart strategy, authentication, checkout, routing, SEO, state management, and key dependencies.
- 11 embedded Mermaid diagrams (C4Context, flowcharts, sequence diagrams, mindmap).
- Multiple markdown summary tables (e.g. State Management Summary).

Currently, this document is only accessible in raw repository source and lacks a browsable UI representation.

## Technical Strategy

1. **Build-Time Content Ingestion:**
   - Import `ARCHITECTURE.md` directly via Vite's raw import:
     `import rawArchitectureMarkdown from '../../ARCHITECTURE.md?raw'`
   - Ensure changes to `ARCHITECTURE.md` update the rendered page on build without code duplication.

2. **Component & Rendering (`src/pages/ArchitecturePage.jsx`):**
   - Parse markdown content (converting headings, paragraphs, lists, tables, and mermaid code blocks into semantic JSX/HTML).
   - Render mermaid code blocks inside identifiable container elements (e.g., `<div className="mermaid-chart" data-diagram="...">`).
   - Dynamically load Mermaid.js from CDN (`https://cdn.jsdelivr.net/npm/mermaid@11/dist/mermaid.esm.min.mjs`) on client mount.
   - Initialize `mermaid.run()` targeting the diagram containers with a custom theme aligned to `#2c2416` and `#D4AF37`.
   - Guard DOM / window APIs so server-side prerendering (`src/entry-server.jsx`) executes cleanly without errors.

3. **Routing & Navigation:**
   - Add `/architecture` route to `src/main.jsx` and `src/entry-server.jsx`.
   - Add "Architecture" link to `<header>` navigation and `<footer>` in `src/App.jsx`.

4. **Styling (`src/pages/ArchitecturePage.css`):**
   - Use `#2c2416` text on `#faf8f3` surface with gold accents `#D4AF37`.
   - Responsive diagram containers with horizontal scrolling for large sequence diagrams and flowcharts on mobile viewports.
   - Strictly follow Stylelint standards.

## Testing Blueprint

### RED Policy & Unit Tests
1. **Policy Test (`scripts/tests/architecture-page.policy.mjs`):**
   - Asserts `ArchitecturePage.jsx` and `ArchitecturePage.css` exist.
   - Asserts route `/architecture` is registered in `src/main.jsx` and `src/entry-server.jsx`.
   - Asserts navigation links to `/architecture` exist in `src/App.jsx`.
   - Asserts raw markdown build-time import is used.
2. **Component Test (`src/pages/ArchitecturePage.test.jsx`):**
   - Verifies component renders title and main architecture sections.
   - Verifies table rendering for state management summary.
   - Verifies mermaid diagram containers are mounted with diagram definitions.
   - Verifies SSR / non-DOM environments render gracefully without errors.

### Regression Suite
- `node --test scripts/tests/architecture-page.policy.mjs`
- `node --test scripts/tests/stylelint-css-compliance.policy.mjs`
- `npm test -- --run`
- `npm run build`

## Edge Cases & Risk Analysis

| Scenario                   | Risk / Consideration                                                  | Mitigation                                                                                                         |
|----------------------------|-----------------------------------------------------------------------|--------------------------------------------------------------------------------------------------------------------|
| SSR Prerendering           | Mermaid.js requires DOM APIs (`document`, `window`, SVG DOM).         | Guard Mermaid loading/initialization inside `useEffect` (client-only) so SSR renders HTML markup without throwing. |
| CDN network failure        | CDN load could time out or fail on restricted networks.               | Fall back gracefully to showing clean styled pre/code blocks if CDN script fails.                                  |
| Diagram overflow on mobile | Large sequence diagrams (e.g. Checkout flow) can exceed screen width. | Wrap diagram containers in overflow-x: auto scrollable cards.                                                      |
| Stylelint compliance       | New CSS file must not violate modern CSS standards.                   | Validate against `scripts/tests/stylelint-css-compliance.policy.mjs`.                                              |

## Acceptance Criteria

- [ ] `scripts/tests/architecture-page.policy.mjs` passes GREEN after implementation.
- [ ] `src/pages/ArchitecturePage.test.jsx` passes GREEN.
- [ ] `/architecture` is accessible via browser and site navigation.
- [ ] All 11 Mermaid diagrams render as SVG charts on the client.
- [ ] Full Vitest suite (`npm test -- --run`) and build (`npm run build`) pass.
