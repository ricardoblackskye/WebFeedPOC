import { describe, it, expect, vi, afterEach } from 'vitest'
import { render, screen, cleanup } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import HomePage from './HomePage'

function renderHomePage(context = {}) {
  const ctx = {
    products: [],
    loading: false,
    error: null,
    categories: [],
    productCounts: { All: 0 },
    addToCart: vi.fn(),
    ...context,
  }

  return render(
    <MemoryRouter initialEntries={['/']}>
      <Routes>
        <Route path="/" element={<Outlet context={ctx} />}>
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

afterEach(cleanup)

describe('HomePage', () => {
  it('renders the Dark Factory footer line with the exact text on the home page', () => {
    renderHomePage()
    expect(screen.getByText('Built by the Dark Factory - by the Developer Agent')).toBeDefined()
  })

  it('renders the Dark Factory footer line inside an em element so it displays in italics', () => {
    renderHomePage()
    const line = screen.getByText('Built by the Dark Factory - by the Developer Agent')
    expect(line.tagName).toBe('EM')
    expect(line.closest('footer')).not.toBeNull()
  })

  it('still renders existing home page content unchanged after adding the footer line', () => {
    renderHomePage()
    expect(screen.getByText('No products available')).toBeDefined()
    expect(screen.getByText('Built by the Dark Factory - by the Developer Agent')).toBeDefined()
  })
})
