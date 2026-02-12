import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import CategoryFilter from '../components/CategoryFilter'

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
})
