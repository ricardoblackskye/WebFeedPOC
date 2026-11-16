import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter, Outlet, Route, Routes } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import HomePage from './HomePage'

const FOOTER_TEXT = 'Built by the Dark Factory - by the Developer Agent'

function renderHomePage({ context = {}, url = '/' } = {}) {
  const outletContext = {
    products: [],
    loading: false,
    error: null,
    categories: [],
    productCounts: { All: 0 },
    addToCart: () => {},
    ...context,
  }

  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[url]}>
        <Routes>
          <Route element={<Outlet context={outletContext} />}>
            <Route path="/" element={<HomePage />} />
          </Route>
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  )
}

describe('HomePage footer', () => {
  it('renders the Dark Factory footer line in italics', () => {
    renderHomePage()
    expect(screen.getByText(FOOTER_TEXT).tagName).toBe('EM')
  })

  it('renders the footer copy exactly once with ASCII hyphen', () => {
    renderHomePage()
    const matches = screen.getAllByText(FOOTER_TEXT)
    expect(matches).toHaveLength(1)
    expect(matches[0].textContent).toBe('Built by the Dark Factory - by the Developer Agent')
  })

  it('renders the footer line while products are loading', () => {
    renderHomePage({ context: { loading: true } })
    expect(screen.getByText(FOOTER_TEXT).tagName).toBe('EM')
  })

  it('renders the footer line when no products are available', () => {
    renderHomePage()
    expect(screen.getByText('No products available')).toBeDefined()
    expect(screen.getByText(FOOTER_TEXT).tagName).toBe('EM')
  })

  it('renders the footer line when a search query is present', () => {
    renderHomePage({ url: '/?search=chair' })
    expect(screen.getByText(FOOTER_TEXT).tagName).toBe('EM')
  })
})
