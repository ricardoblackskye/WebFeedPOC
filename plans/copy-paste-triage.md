# Copy-Paste Triage

## Decision map

### Intentional/generated Speckit overlap

The `.specify/` extension and script copies are treated as generated or upstream-managed Speckit assets. Do not hand-refactor these files without changing their upstream source or regeneration process. Review a future narrowly scoped jscpd exclusion only if the generated-file status is confirmed.

### Application and test duplication

The following are candidates for future focused refactors, but are not changed in this triage pass:

- Repeated setup and interaction blocks in `src/App.test.jsx`, `src/components/Cart.test.jsx`, and `src/components/ProductModal.test.jsx`.
- Repeated Wix hook fixtures in `src/hooks/useWixCart.test.js`, `src/hooks/useWixContent.test.js`, and `src/hooks/useWixProducts.test.js`.
- Shared page rendering patterns in `src/pages/CategoryPage.jsx` and `src/pages/HomePage.jsx`.
- Repeated CSS declarations across cart, modal, order, and product styles.

These require behavior-focused tests before extraction and should be split into follow-up issues rather than bundled into a configuration change.

### Maintainability policy

Do not lower jscpd thresholds or disable `COPYPASTE_JSCPD` globally. Remaining findings should be reviewed as intentional, generated, or actionable on a case-by-case basis.

## Acceptance

- Generated/vendor overlap is explicitly classified.
- Application duplication remains visible to jscpd.
- Follow-up refactors can be implemented independently with regression tests.
