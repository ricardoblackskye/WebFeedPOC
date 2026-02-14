import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import SortControls from './SortControls'

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
