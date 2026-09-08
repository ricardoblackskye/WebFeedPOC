import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'
import { MemoryRouter, Routes, Route } from 'react-router-dom'
import ProductPage from './ProductPage'

vi.mock('../utils/helpers', () => ({
  stripHtml: (html) => (html || '').replace(/<[^>]*>/g, ''),
}))

vi.mock('../utils/structuredData', () => ({
  generateProductSchema: () => ({}),
  generateBreadcrumbSchema: () => ({}),
  SITE_NAME: 'WebFeedPOC',
}))

const mockProduct = {
  id: '1',
  name: 'Vintage Camera',
  slug: 'vintage-camera',
  description: '<p>A classic film camera.</p>',
  price: 199.99,
  image: 'https://example.com/camera.jpg',
  images: ['https://example.com/camera.jpg', 'https://example.com/camera-2.jpg'],
  category: 'Cameras',
  stock: { trackInventory: false },
}

const renderProductPage = (product = mockProduct) => {
  const products = [product]
  return render(
    <HelmetProvider>
      <MemoryRouter initialEntries={[`/products/${product.slug}`]}>
        <Routes>
          <Route path="products/:slug" element={<ProductPage products={products} onAddToCart={() => {}} />} />
        </Routes>
      </MemoryRouter>
    </HelmetProvider>
  )
}

describe('ProductPage Image Modal', () => {
  it('clicking the main image opens the full-size image modal', () => {
    const { container } = renderProductPage()
    const mainImage = container.querySelector('.product-page-main-image')
    expect(mainImage).toBeTruthy()
    fireEvent.click(mainImage)
    const modalImage = container.querySelector('.image-modal-image')
    expect(modalImage).toBeTruthy()
    expect(modalImage.getAttribute('src')).toBe('https://example.com/camera.jpg')
  })

  it('closes the modal when the close button is clicked', () => {
    const { container } = renderProductPage()
    const mainImage = container.querySelector('.product-page-main-image')
    fireEvent.click(mainImage)
    const closeButton = container.querySelector('.image-modal-close')
    expect(closeButton).toBeTruthy()
    fireEvent.click(closeButton)
    expect(container.querySelector('.image-modal-image')).toBeNull()
  })

  it('navigates to next and previous images inside the modal', () => {
    const { container } = renderProductPage()
    fireEvent.click(container.querySelector('.product-page-main-image'))
    const navButtons = container.querySelectorAll('.image-modal-nav button')
    expect(navButtons.length).toBe(2)
    // Next
    fireEvent.click(navButtons[1])
    expect(container.querySelector('.image-modal-image').getAttribute('src')).toBe('https://example.com/camera-2.jpg')
    // Prev (wrap to last = index 0 in 2-image list)
    fireEvent.click(navButtons[0])
    expect(container.querySelector('.image-modal-image').getAttribute('src')).toBe('https://example.com/camera.jpg')
  })
})