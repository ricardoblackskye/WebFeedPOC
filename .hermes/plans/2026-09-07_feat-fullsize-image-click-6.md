# Full-size Image Click on Product Page

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Allow users to click the main product image on the product details page to view the full-size image in a modal popup that can be closed.

**Root cause (verified):** The ProductPage component displays a thumbnail-sized main image (max 600x600) but does not provide a way to view the original full-size image. Users cannot zoom or see details.

**Intended fix:** Add click handler to the main image that opens a modal displaying the selected image at full size (limited to viewport). Reuse existing ProductModal infrastructure or create a lightweight ImageModal component. Ensure modal can be closed via click on backdrop, close button, or Escape key.

**Files likely to change:**
- src/components/ProductPage.jsx (add state, click handler, modal rendering)
- src/components/ProductModal.jsx (optional: add fullscreen prop to allow larger image) OR create new src/components/ImageModal.jsx
- src/components/ProductModal.css (optional: add fullscreen image styles) OR new CSS for ImageModal
- src/components/ProductPage.css (optional: add cursor pointer to indicate clickable)
- src/components/ProductPage.test.jsx (add test for click opening modal)
- src/components/ImageModal.test.jsx (if new component)

**Tasks (TDD):**
Task 1: Write failing test for click opening modal (RED)
Task 2: Implement minimal changes to ProductPage to open modal on image click (GREEN)
Task 3: Implement modal component (either extend ProductModal or create ImageModal) to display full-size image
Task 4: Add close functionality (backdrop, ESC, button)
Task 5: Style modal to show image at full size (max viewport)
Task 6: Write test for modal closing
Task 7: Run full test suite to ensure no regressions
Task 8: Manual verification: click image, see full-size image, close modal

**Validation:**
- npm test passes
- Manual testing: click product image on ProductPage, verify modal opens with large image, verify closing works
- No regressions in existing functionality (cart, etc.)

**Risks/Open questions:**
- Should we reuse ProductModal or create a new component? Reusing may introduce unwanted complexity (like stock indicator, add to cart button) that we don't need for image-only modal. Creating a new component keeps concerns separate but duplicates some modal backdrop logic. We'll evaluate based on code reuse.
