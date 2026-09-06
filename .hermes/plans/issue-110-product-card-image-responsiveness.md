# #110 Product Card & Image Responsiveness — Implementation Plan

## Goal
Make product cards responsive and ensure images maintain aspect ratio, text is readable, and no overflow occurs at any screen size.

## Tasks from Issue
- [ ] `.product-image` has fixed `height: 240px` — replace with `aspect-ratio: 4/3` or proportional sizing
- [ ] Add `srcset` / `sizes` attribute to product images for responsive image loading (or ensure they scale via CSS)
- [ ] `.product-name` font-size `1.25rem` — consider slightly smaller on mobile
- [ ] `.product-card` padding review: `1.25rem` — reduce to `0.75rem` on mobile
- [ ] Ensure `.product-card` min-width doesn't cause overflow in grid
- [ ] Add Playwright visual assertions: card widths match expected grid column widths at each breakpoint
- [ ] Stock indicator positioning: ensure it doesn't overlap or break layout on small cards

## Acceptance Criteria
- Images maintain aspect ratio and don't get squashed/stretched
- Card text is readable without zoom on mobile
- No content overflow on any card

## Current State Analysis
From examining `/src/components/ProductCard.css` and `.jsx`:

1. `.product-image` has fixed height: 240px (line 22)
2. Image uses `width: 100%; height: 100%; object-fit: cover;` (lines 28-30) which maintains aspect ratio but crops
3. `.product-info` padding: 1.25rem (line 44)
4. `.product-name` font-size: 1.25rem (line 48)
5. `.product-description` font-size: 0.9rem (line 55)
6. No `srcset` or `sizes` attributes on image
7. No stock indicator visible in current code (might be in product data but not displayed)

## Plan

### 1. Fix Product Image Aspect Ratio
Replace fixed height with aspect-ratio property or proportional sizing.
- Option A: Use `aspect-ratio: 4/3` on `.product-image` (modern browsers)
- Option B: Use padding-top trick for broader support
Given the project already uses modern CSS (clamp, etc.), we'll use `aspect-ratio`.

### 2. Responsive Image Loading
Add `srcset` and `sizes` attributes to the img element.
We need to determine appropriate image sizes. Since we don't have multiple image resolutions from Wix, we can:
- Use the same image but specify sizes for layout width
- Or rely on CSS scaling if the image is already high resolution
Given the Wix integration, we'll assume we can get multiple image URLs. However, looking at the product data structure, we only have one `image` field.
We'll implement `srcset` with the same image for now (still beneficial for density descriptors) and note that we need backend support for multiple resolutions.
Alternatively, we can use CSS-only solution: ensure the image scales properly without fixed height.

### 3. Responsive Typography
Adjust font sizes for mobile:
- `.product-name`: reduce from 1.25rem to maybe 1.1rem or use clamp
- `.product-description`: reduce from 0.9rem to 0.8rem or use clamp
We'll use clamp() for fluid typography that scales with viewport.

### 4. Responsive Padding
Reduce `.product-info` padding on mobile:
- Desktop: 1.25rem
- Mobile: 0.75rem
We'll use a media query at the same breakpoint as used elsewhere (likely 768px or 640px based on issue #108).

### 5. Prevent Overflow
Ensure `.product-card` doesn't cause grid overflow:
- Check min-width implications
- Add `overflow: hidden` or `text-overflow: ellipsis` for text if needed
- Ensure long product names don't break layout

### 6. Stock Indicator
Check if stock indicator exists in the UI. If not, we may need to add it.
Looking at the JSX, there's no stock indicator displayed. We'll need to:
- Add stock display logic (maybe a badge)
- Ensure it doesn't overlap on small cards

### 7. Testing
Add Playwright visual tests to verify:
- Card widths at different breakpoints
- Image aspect ratio
- Text readability
- No overflow

## Breakpoints
We'll align with the breakpoints established in issue #108:
- Mobile: ≤640px (hamburger breakpoint)
- Tablet: 641px - 768px
- Desktop: ≥769px

Or we can use the same as ProductList.css: ≤479px (phones), 480-768px (tablets), ≥769px (desktop)
We'll check what's used elsewhere.

From ProductList.css:
- phones: ≤479px
- tablets: 480-768px
We'll use these for consistency.

## Files to Change
- `src/components/ProductCard.css` - main styling changes
- `src/components/ProductCard.jsx` - add srcset/sizes and stock indicator
- `src/components/ProductCard.test.jsx` - update unit tests if needed
- `e2e/product-card-responsiveness.spec.ts` - new e2e test file

## Implementation Steps (TDD Style)

### RED: Write failing tests
1. Write Playwright test that checks image aspect ratio at different viewport widths
2. Write test that checks font sizes are reduced on mobile
3. Write test that checks padding is reduced on mobile
4. Write test that checks no overflow occurs

### GREEN: Implement fixes
1. Update ProductCard.css with aspect-ratio, responsive typography, responsive padding
2. Update ProductCard.jsx to add srcset/sizes and stock indicator
3. Ensure all tests pass

### REFACTOR: Clean up code
- Ensure CSS is clean and uses variables where appropriate
- Verify accessibility (contrast, etc.)

## Risks
- Changing image height might affect layout if images have varying aspect ratios (object-fit: cover will crop)
- Adding srcset might break if image URLs don't support size variations
- Stock indicator addition might require design changes

## References
- Issue #110: https://github.com/ricardoblackskye/WebFeedPOC/issues/110
- Issue #108 plan for breakpoint conventions: .hermes/plans/issue-108-layout-responsiveness.md