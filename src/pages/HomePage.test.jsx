import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
// All router primitives must come from a single module instance so that the
// RouterContext / OutletContext objects shared with HomePage.jsx (which imports
// from 'react-router-dom') are the same. Importing StaticRouter from the bare
// 'react-router' specifier resolves to a different (CJS) build here and makes
// <Routes> throw "useRoutes() may be used only in the context of a <Router>".
import { MemoryRouter, Routes, Route, Outlet, StaticRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import HomePage from './HomePage'

const FOOTER_LINE = 'Built by the Dark Factory - by the Developer Agent'

// HomePage reads everything through useOutletContext() and useSearchParams(),
// so it must be mounted inside a router that supplies both a route context and
// a location. The context shape mirrors App.jsx's <Outlet context={{...}} />.
const outletContext = {
  products: [],
  loading: false,
  error: null,
  categories: [],
  productCounts: { All: 0 },
  addToCart: vi.fn(),
}

const routes = (
  <Routes>
    <Route path="/" element={<Outlet context={outletContext} />}>
      <Route index element={<HomePage />} />
    </Route>
  </Routes>
)

function renderHomePage() {
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={['/']}>{routes}</MemoryRouter>
    </HelmetProvider>
  )
}

describe('HomePage Dark Factory footer line', () => {
  it('renders the Dark Factory footer line on the home page', () => {
    renderHomePage()
    expect(screen.getByText(FOOTER_LINE)).toBeDefined()
  })

  it('renders the Dark Factory footer line as italic text (em element)', () => {
    renderHomePage()
    expect(screen.getByText(FOOTER_LINE).tagName).toBe('EM')
  })

  it('renders the footer line exactly once without changing existing home page content', () => {
    const { container } = renderHomePage()
    expect(screen.getAllByText(FOOTER_LINE)).toHaveLength(1)
    expect(screen.getByRole('heading', { name: /All Items/ })).toBeDefined()
    expect(container.textContent).not.toContain('All rights reserved')
  })

  it('renders the footer line under the SSR router used by prerendering', () => {
    render(
      <HelmetProvider>
        <StaticRouter location="/">{routes}</StaticRouter>
      </HelmetProvider>
    )
    expect(screen.getByText(FOOTER_LINE).tagName).toBe('EM')
  })
})
