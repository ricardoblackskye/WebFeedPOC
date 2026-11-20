import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { createMemoryRouter, RouterProvider, Outlet } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import HomePage from './HomePage'

const outletContext = {
  products: [],
  loading: false,
  error: null,
  categories: [],
  productCounts: { All: 0 },
  addToCart: vi.fn(),
}

function renderHomePage() {
  const router = createMemoryRouter(
    [
      {
        path: '/',
        element: <Outlet context={outletContext} />,
        children: [{ index: true, element: <HomePage /> }],
      },
    ],
    { initialEntries: ['/'] }
  )
  return render(
    <HelmetProvider>
      <RouterProvider router={router} />
    </HelmetProvider>
  )
}

describe('HomePage', () => {
  it('renders the Dark Factory credit in italics on the home page', () => {
    renderHomePage()
    const credit = screen.getByText('Built by the Dark Factory - by the Developer Agent')
    expect(credit).toBeDefined()
    expect(credit.tagName).toBe('EM')
    expect(credit.closest('footer')).not.toBeNull()
  })

  it('still renders the existing home page content unchanged', () => {
    renderHomePage()
    expect(screen.getByText(/All Items/)).toBeDefined()
    expect(screen.getByText('No products available')).toBeDefined()
  })
})
