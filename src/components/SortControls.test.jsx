import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import SortControls from './SortControls'

// Read the CSS from disk so we can assert the responsive contract independent
// of jsdom, which does NOT apply stylesheets or @media queries. Real
// computed-style verification happens in the Playwright e2e suite. Mirrors the
// repo's tests/lint-config.test.js pattern (fs.readFileSync + process.cwd()).
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
