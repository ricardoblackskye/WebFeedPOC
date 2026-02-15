import React from 'react'
import { renderToString } from 'react-dom/server'
import { StaticRouter } from 'react-router'
import { Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import HomePage from './pages/HomePage.jsx'
import ProductPageWrapper from './pages/ProductPageWrapper.jsx'
import CategoryPage from './pages/CategoryPage.jsx'

// Re-export for the prerender script to use
export { fetchWixProducts } from './services/wixService.js'

/**
 * Server-side render function for prerendering.
 * @param {string} url - The URL path to render
 * @param {Object} data - Pre-fetched data
 * @param {Array} data.products - Products array from Wix
 * @returns {{ html: string, head: Object }}
 */
export function render(url, data = {}) {
  const helmetContext = {}

  const html = renderToString(
    <HelmetProvider context={helmetContext}>
      <StaticRouter location={url}>
        <Routes>
          <Route path="/" element={<App initialProducts={data.products} />}>
            <Route index element={<HomePage />} />
            <Route path="products/:slug" element={<ProductPageWrapper />} />
            <Route path="category/:categoryName" element={<CategoryPage />} />
          </Route>
        </Routes>
      </StaticRouter>
    </HelmetProvider>
  )

  return {
    html,
    head: helmetContext.helmet,
  }
}
