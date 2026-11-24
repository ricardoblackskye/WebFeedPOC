import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import CategoryFilter from '../components/CategoryFilter'

// Read the stylesheet from disk rather than using a `?raw` import: this mirrors
// the pattern already proven in SortControls.test.jsx / tests/lint-config.test.js
// (fs.readFileSync + process.cwd()) and keeps the stylesheet assertions
// independent of jsdom, which does NOT apply stylesheets.
const cssText = readFileSync(
  path.resolve(process.cwd(), 'src/components/CategoryFilter.css'),
  'utf8'
)

describe('CategoryFilter', () => {
  const mockCategories = ['Furniture', 'Lighting', 'Decorative Arts']
  const mockProductCounts = {
    'All': 15,
    'Furniture': 5,
    'Lighting': 3,
    'Decorative Arts': 7,
  }
  const mockOnCategoryChange = vi.fn()

  beforeEach(() => {
    mockOnCategoryChange.mockClear()
  })

  // Strip CSS comments first, then collapse whitespace so the rule parser is
  // not confused by the explanatory comment that precedes the :has() rule and
  // does not depend on declaration order or formatting.
  const normalizeCss = (css) =>
    css.replace(/\/\*[\s\S]*?\*\//g, ' ').replace(/\s+/g, ' ').trim()

  const getDeclarations = (selector) => {
    const normalized = normalizeCss(cssText)
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

  it('renders all categories', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="All"
        onCategoryChange={mockOnCategoryChange}
        productCounts={mockProductCounts}
      />
    )

    expect(screen.getByText('All Items')).toBeDefined()
    expect(screen.getByText('Furniture')).toBeDefined()
    expect(screen.getByText('Lighting')).toBeDefined()
    expect(screen.getByText('Decorative Arts')).toBeDefined()
  })

  it('displays product counts correctly', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="All"
        onCategoryChange={mockOnCategoryChange}
        productCounts={mockProductCounts}
      />
    )

    expect(screen.getByText('15')).toBeDefined()
    expect(screen.getByText('5')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
    expect(screen.getByText('7')).toBeDefined()
  })

  it('highlights selected category', () => {
    const { container } = render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="Furniture"
        onCategoryChange={mockOnCategoryChange}
        productCounts={mockProductCounts}
      />
    )

    const activeButtons = container.querySelectorAll('.category-btn.active')
    expect(activeButtons.length).toBe(1)
    expect(activeButtons[0].textContent).toContain('Furniture')
  })

  it('calls onCategoryChange when category clicked', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="All"
        onCategoryChange={mockOnCategoryChange}
        productCounts={mockProductCounts}
      />
    )

    const furnitureButton = screen.getByText('Furniture')
    fireEvent.click(furnitureButton)

    expect(mockOnCategoryChange).toHaveBeenCalledWith('Furniture')
  })

  it('calls onCategoryChange with "All" when All Items clicked', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="Furniture"
        onCategoryChange={mockOnCategoryChange}
        productCounts={mockProductCounts}
      />
    )

    const allButton = screen.getByText('All Items')
    fireEvent.click(allButton)

    expect(mockOnCategoryChange).toHaveBeenCalledWith('All')
  })

  it('renders when no categories provided', () => {
    render(
      <CategoryFilter
        categories={[]}
        selectedCategory="All"
        onCategoryChange={mockOnCategoryChange}
        productCounts={{ 'All': 0 }}
      />
    )

    expect(screen.getByText(/All Items/i)).toBeDefined()
  })

  it("renders the 'Categories' heading in bold gold", () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="All"
        onCategoryChange={mockOnCategoryChange}
        productCounts={mockProductCounts}
      />
    )

    expect(screen.getByText('Categories')).toBeDefined()

    const decls = getDeclarations('.category-filter-title')
    expect(hasGold(decls)).toBe(true)
    expect(decls).toMatch(/font-weight:\s*700/)
  })

  it('resting category buttons use the same bold gold as their hover state', () => {
    const base = getDeclarations('.category-btn')
    const hover = getDeclarations('.category-btn:hover')

    expect(hasGold(base)).toBe(true)
    expect(base).toMatch(/font-weight:\s*700/)
    expect(hasGold(hover)).toBe(true)
    expect(hover).toMatch(/font-weight:\s*700/)
  })

  it('category buttons still render their labels and counts (no regression)', () => {
    render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="All"
        onCategoryChange={mockOnCategoryChange}
        productCounts={mockProductCounts}
      />
    )

    expect(screen.getByText('All Items')).toBeDefined()
    expect(screen.getByText('Furniture')).toBeDefined()
    expect(screen.getByText('Lighting')).toBeDefined()
    expect(screen.getByText('Decorative Arts')).toBeDefined()
    expect(screen.getByText('15')).toBeDefined()
    expect(screen.getByText('5')).toBeDefined()
    expect(screen.getByText('3')).toBeDefined()
    expect(screen.getByText('7')).toBeDefined()
  })

  it('the active category keeps its distinct gold-fill treatment', () => {
    const { container } = render(
      <CategoryFilter
        categories={mockCategories}
        selectedCategory="Furniture"
        onCategoryChange={mockOnCategoryChange}
        productCounts={mockProductCounts}
      />
    )

    const activeButtons = container.querySelectorAll('.category-btn.active')
    expect(activeButtons.length).toBe(1)
    expect(activeButtons[0].textContent).toContain('Furniture')

    const activeDecls = getDeclarations('.category-btn.active')
    expect(activeDecls).toMatch(/color:\s*#1a1a1a/i)
    expect(hasGold(activeDecls)).toBe(true)
  })

  it('home-page item-count heading is styled with the nav gold token', () => {
    const decls = getDeclarations('.products-section h2:has(> .product-count)')
    expect(hasGold(decls)).toBe(true)
    expect(decls).toMatch(/font-weight:\s*700/)
  })

  it('the count span itself is bold', () => {
    const decls = getDeclarations('.product-count')
    expect(decls).toMatch(/font-weight:\s*700/)
  })

  it('the rule cannot match unrelated headings', () => {
    expect(cssText).toMatch(/\.products-section\s+h2:has\(>\s*\.product-count\)/)
  })
})
