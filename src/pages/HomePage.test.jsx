import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Routes, Route, Outlet } from 'react-router-dom'
import HomePage from './HomePage'

const CREDIT_TEXT = 'Built by the Dark Factory - by the Developer Agent'

function renderHomePage(context = {}) {
  const outletContext = {
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
        <Route path='/' element={<Outlet context={outletContext} />}>
          <Route index element={<HomePage />} />
        </Route>
      </Routes>
    </MemoryRouter>
  )
}

describe('HomePage - Dark Factory credit', () => {
  it('renders the Dark Factory credit line with the exact copy', () => {
    renderHomePage()
    expect(screen.getByText('Built by the Dark Factory - by the Developer Agent')).toBeDefined()
  })

  it('renders the credit line without removing existing home page content', () => {
    renderHomePage()
    expect(screen.getByText('No products available')).toBeDefined()
    expect(screen.getAllByText(CREDIT_TEXT)).toHaveLength(1)
  })
})

describe('HomePage - credit line styling', () => {
  it('renders the credit line in italics', () => {
    renderHomePage()
    const credit = screen.getByText(CREDIT_TEXT)
    expect(credit.style.fontStyle).toBe('italic')
  })
})
