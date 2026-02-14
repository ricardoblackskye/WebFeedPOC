import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Pagination from './Pagination'

describe('Pagination', () => {
  const defaultProps = {
    currentPage: 1,
    totalPages: 5,
    onPageChange: vi.fn(),
  }

  it('renders page buttons and navigation', () => {
    render(<Pagination {...defaultProps} />)

    expect(screen.getByText('Previous')).toBeDefined()
    expect(screen.getByText('Next')).toBeDefined()
    expect(screen.getByText('1')).toBeDefined()
    expect(screen.getByText('5')).toBeDefined()
  })

  it('returns null when totalPages is 1', () => {
    const { container } = render(<Pagination {...defaultProps} totalPages={1} />)
    expect(container.innerHTML).toBe('')
  })

  it('disables Previous button on first page', () => {
    render(<Pagination {...defaultProps} currentPage={1} />)
    expect(screen.getByText('Previous').disabled).toBe(true)
  })

  it('disables Next button on last page', () => {
    render(<Pagination {...defaultProps} currentPage={5} />)
    expect(screen.getByText('Next').disabled).toBe(true)
  })

  it('calls onPageChange when page clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination {...defaultProps} onPageChange={onPageChange} />)

    fireEvent.click(screen.getByText('3'))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange when Next clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination {...defaultProps} currentPage={2} onPageChange={onPageChange} />)

    fireEvent.click(screen.getByText('Next'))
    expect(onPageChange).toHaveBeenCalledWith(3)
  })

  it('calls onPageChange when Previous clicked', () => {
    const onPageChange = vi.fn()
    render(<Pagination {...defaultProps} currentPage={3} onPageChange={onPageChange} />)

    fireEvent.click(screen.getByText('Previous'))
    expect(onPageChange).toHaveBeenCalledWith(2)
  })

  it('highlights current page', () => {
    render(<Pagination {...defaultProps} currentPage={3} />)
    const activeButton = screen.getByText('3')
    expect(activeButton.className).toContain('active')
  })

  it('shows ellipsis for many pages', () => {
    render(<Pagination {...defaultProps} totalPages={20} currentPage={10} />)
    const ellipses = screen.getAllByText('…')
    expect(ellipses.length).toBeGreaterThan(0)
  })
})
