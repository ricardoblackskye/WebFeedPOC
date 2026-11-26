import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import Pagination from './Pagination'

const FOOTER_TEXT = 'Built by the Dark Factory - by the Developer Agent'

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

  it('hides pagination controls when totalPages is 1 but still renders the footer', () => {
    const { container } = render(<Pagination {...defaultProps} totalPages={1} />)
    expect(container.querySelector('.pagination')).toBeNull()
    expect(container.querySelector('.pagination-footer')).not.toBeNull()
    expect(screen.getByText(FOOTER_TEXT)).toBeDefined()
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

  it('renders the Dark Factory credit line at the foot of the home page', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByText(FOOTER_TEXT)).toBeDefined()
  })

  it('renders the Dark Factory credit line in italics', () => {
    render(<Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />)
    expect(screen.getByText(FOOTER_TEXT).tagName).toBe('EM')
  })

  it('places the credit line after the existing pagination markup', () => {
    const { container } = render(
      <Pagination currentPage={1} totalPages={3} onPageChange={vi.fn()} />
    )
    const footer = container.querySelector('.pagination-footer')
    expect(footer).not.toBeNull()
    expect(footer.parentElement.lastElementChild).toBe(footer)
  })

  it('declares font-style: italic for the home-page footer line', () => {
    const cssText = readFileSync(
      path.resolve(process.cwd(), 'src/components/Pagination.css'),
      'utf8'
    )
    const stripped = cssText.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\s+/g, ' ')
    const match = stripped.match(/\.pagination-footer\s*\{([^}]*)\}/)
    expect(match).not.toBeNull()
    const declarations = match[1]
    expect(declarations).toMatch(/font-style:\s*italic/)
    const occurrences = declarations.match(/font-style:\s*italic/g) || []
    expect(occurrences.length).toBe(1)
  })
})
