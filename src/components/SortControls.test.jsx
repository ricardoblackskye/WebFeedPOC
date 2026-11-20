import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import SortControls from './SortControls'

// Read the CSS from disk so we can assert the responsive contract independent
// of jsdom, which does NOT apply stylesheets or @media queries. Real
// computed-style verification happens in the Playwright e2e suite. Mirrors the
// repo's tests/lint-config.test.js pattern (fs.readFileSync + process.cwd()).
// We use this same on-disk text for the #242 gold assertions (rather than a
// `?raw` import) because `?raw` is not reliably resolvable under this Vitest
// setup, whereas readFileSync is the established, passing pattern here.
const cssRaw = readFileSync(
  path.resolve(process.cwd(), 'src/components/SortControls.css'),
  'utf8'
)

describe('SortControls', () => {
  const defaultProps = {
    sortBy: 'name-asc',
    onSortChange: vi.fn(),
    searchTerm: '',
    onSearchChange: vi.fn(),
  }

  it('renders search input and sort select', () => {
    render(<SortControls {...defaultProps} />)

    expect(screen.getByPlaceholderText('Search products...')).toBeDefined()
    expect(screen.getByLabelText('Sort by:')).toBeDefined()
  })

  it('displays current sort value', () => {
    render(<SortControls {...defaultProps} sortBy="price-desc" />)

    const select = screen.getByLabelText('Sort by:')
    expect(select.value).toBe('price-desc')
  })

  it('calls onSortChange when sort option selected', () => {
    const onSortChange = vi.fn()
    render(<SortControls {...defaultProps} onSortChange={onSortChange} />)

    const select = screen.getByLabelText('Sort by:')
    fireEvent.change(select, { target: { value: 'price-asc' } })

    expect(onSortChange).toHaveBeenCalledWith('price-asc')
  })

  it('calls onSearchChange when typing in search', () => {
    const onSearchChange = vi.fn()
    render(<SortControls {...defaultProps} onSearchChange={onSearchChange} />)

    const input = screen.getByPlaceholderText('Search products...')
    fireEvent.change(input, { target: { value: 'vase' } })

    expect(onSearchChange).toHaveBeenCalledWith('vase')
  })

  it('displays current search term', () => {
    render(<SortControls {...defaultProps} searchTerm="clock" />)

    const input = screen.getByPlaceholderText('Search products...')
    expect(input.value).toBe('clock')
  })
})

// ---------------------------------------------------------------------------
// Issue #111 — responsive contract (RED until SortControls.css is fixed)
// These pin the CSS requirements that jsdom cannot evaluate:
//   - inputs >= 16px font-size (prevents iOS focus zoom)
//   - inputs >= 44px min-height (WCAG 2.5.5 touch target)
//   - vertical stack of search + sort at the phone tier (<=479px)
// ---------------------------------------------------------------------------
describe('SortControls responsive CSS contract (#111)', () => {
  it('enforces a minimum 16px font-size on search input and sort select', () => {
    expect(cssRaw, 'SortControls.css should declare 16px font-size on .search-input')
      .toMatch(/\.search-input\s*\{[^}]*font-size:\s*16px/)
    expect(cssRaw, 'SortControls.css should declare 16px font-size on .sort-select')
      .toMatch(/\.sort-select\s*\{[^}]*font-size:\s*16px/)
  })

  it('enforces a minimum 44px touch-target height on inputs', () => {
    expect(cssRaw, 'SortControls.css should declare min-height: 44px on .search-input')
      .toMatch(/\.search-input\s*\{[^}]*min-height:\s*44px/)
    expect(cssRaw, 'SortControls.css should declare min-height: 44px on .sort-select')
      .toMatch(/\.sort-select\s*\{[^}]*min-height:\s*44px/)
  })

  it('stacks search and sort vertically at phone width (<=479px)', () => {
    // The phone media query must exist and set the controls to a column.
    expect(cssRaw, 'SortControls.css should have a @media (width <= 479px) block')
      .toMatch(/@media\s*\(width\s*<=\s*479px\)/)
    expect(
      cssRaw,
      'the <=479px block must make .sort-controls a vertical column'
    ).toMatch(
      /@media\s*\(width\s*<=\s*479px\)\s*\{[^@]*\.sort-controls\s*\{[^}]*flex-direction:\s*column/
    )
  })
})

// ---------------------------------------------------------------------------
// Story #242 — Consistent Yellow Text (bold gold navigation labels)
// Combines DOM presence assertions (the hooks exist) with stylesheet
// assertions (the rules carry the gold token + font-weight 700).
// ---------------------------------------------------------------------------
describe('SortControls gold navigation text (#242)', () => {
  const defaultProps = {
    sortBy: 'name-asc',
    onSortChange: vi.fn(),
    searchTerm: '',
    onSearchChange: vi.fn(),
  }

  // Strip CSS comments, then collapse whitespace so rule parsing does not
  // depend on formatting or declaration order.
  const normalizeCss = (css) =>
    css.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\s+/g, ' ').trim()

  const getDeclarations = (selector) => {
    const normalized = normalizeCss(cssRaw)
    const ruleRegex = /([^{}]+)\{([^}]*)\}/g
    const declarations = []
    let match
    while ((match = ruleRegex.exec(normalized)) !== null) {
      const selectorList = match[1].trim()
      const decls = match[2].trim()
      const selectors = selectorList.split(',').map((s) => s.trim())
      if (selectors.includes(selector)) {
        declarations.push(decls)
      }
    }
    return declarations.join(' ')
  }

  const hasGold = (text) => /var\(--color-gold\)|#d4af37/i.test(text)

  it("search box still exposes the 'Search Products' placeholder", () => {
    render(<SortControls {...defaultProps} />)
    expect(screen.getByPlaceholderText(/search products/i)).toBeDefined()
  })

  it('placeholder is bold gold', () => {
    const decls = getDeclarations('.search-input::placeholder')
    expect(hasGold(decls)).toBe(true)
    expect(decls).toMatch(/font-weight:\s*700/)
    expect(decls).toMatch(/opacity:\s*1/)
  })

  it('typed search text matches the placeholder treatment', () => {
    const decls = getDeclarations('.search-input')
    expect(hasGold(decls)).toBe(true)
    expect(decls).toMatch(/font-weight:\s*700/)
  })

  it("the 'Sort by' label is bold gold", () => {
    render(<SortControls {...defaultProps} />)
    expect(screen.getByText(/sort by/i)).toBeDefined()

    const decls = getDeclarations('.sort-label')
    expect(hasGold(decls)).toBe(true)
    expect(decls).toMatch(/font-weight:\s*700/)
  })

  it('the sort select value is bold gold', () => {
    render(<SortControls {...defaultProps} />)
    const select = screen.getByRole('combobox')
    expect(select.value).toBe('name-asc')

    const decls = getDeclarations('.sort-select')
    expect(hasGold(decls)).toBe(true)
    expect(decls).toMatch(/font-weight:\s*700/)
  })

  it('the sort arrow is rendered in the same gold (native chevron noted)', () => {
    // This file does not define a custom arrow; the select uses the native
    // browser chevron. Native chevrons cannot be recoloured via CSS without
    // restructuring the control, so per the execution plan we leave it and
    // note the limitation here rather than forcing appearance: none.
    const hasCustomArrow =
      /\.sort-select::(?:after|before)/.test(cssRaw) || /background-image/.test(cssRaw)
    if (!hasCustomArrow) {
      expect(cssRaw).not.toMatch(/\.sort-select::(?:after|before)/)
      return
    }
    const arrowCss =
      getDeclarations('.sort-select::after') +
      getDeclarations('.sort-select::before') +
      getDeclarations('.sort-select')
    expect(hasGold(arrowCss)).toBe(true)
  })
})
