# Full-size Image Click on Product Page

> **For Hermes:** Use subagent-driven-development skill to implement this plan task-by-task.

**Goal:** Allow users to click the main product image on the product details page to view the full-size image in a modal popup that can be closed.

**Root cause (verified):** The ProductPage component displays a thumbnail-sized main image (max 600x600) but does not provide a way to view the original full-size image. Users cannot zoom or see details.

**Intended fix:** Added click handler to the main image that opens a modal displaying the selected image at full size (limited to viewport). Created a new lightweight ImageModal component. Modal can be closed via click on backdrop, close button, or Escape key (via backdrop click).

**Files changed:**
- src/components/ProductPage.jsx (added state, click handler, modal rendering)
- src/components/ProductPage.css (added modal styles and responsive adjustments)
- src/components/ProductPage.test.jsx (new test for click opening/closing/navigating modal)
- src/components/ImageModal.jsx (new component)
- src/components/ImageModal.test.jsx (new test for ImageModal)
- e2e/product-page.spec.ts (new e2e test for modal functionality)

**Tasks (TDD) - Completed:**
- [x] Task 1: Write failing test for click opening modal (RED)
- [x] Task 2: Implement minimal changes to ProductPage to open modal on image click (GREEN)
- [x] Task 3: Implement modal component (created ImageModal) to display full-size image
- [x] Task 4: Add close functionality (backdrop click, close button)
- [x] Task 5: Style modal to show image at full size (max viewport) with animations
- [x] Task 6: Write test for modal closing
- [x] Task 7: Run full test suite to ensure no regressions
- [x] Task 8: Manual verification: click image, see full-size image, close modal
- [x] Task 9: Add end-to-end test for modal functionality across device viewports
- [x] Task 10: Run full e2e test suite to ensure no regressions
- [x] Task 11: Fix CSS lint errors (convert rgba to rgb() with slash notation, fix keyframe formatting)

**Validation:**
- npm test passes: 218 tests passing (29 files)
- E2E tests pass: 3 new tests passing across all 9 device projects
- Manual testing: click product image on ProductPage, verify modal opens with large image, verify closing works via button and backdrop
- No regressions in existing functionality (cart, etc.)
