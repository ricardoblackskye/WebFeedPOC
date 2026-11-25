import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import { readFileSync } from 'node:fs'
import path from 'node:path'
import ProductList from '../components/ProductList'

const cssText = readFileSync(
  path.resolve(process.cwd(), 'src/components/ProductList.css'),
  'utf8'
)

describe('ProductList', () => {
  const mockProducts = [
    {
      id: '1',
      name: 'Product 1',
      slug: 'product-1',
      description: 'Description 1',
      price: 100,
      image: 'https://example.com/image1.jpg',
      category: 'Category A',
    },
    {
      id: '2',
      name: 'Product 2',
      slug: 'product-2',
      description: 'Description 2',
      price: 200,
      image: null,
      category: 'Category B',
    },
  ]

  const mockAddToCart = vi.fn()

  beforeEach(() => {
    mockAddToCart.mockClear()
  })

  const renderList = (products = mockProducts) => {
    return render(
      <MemoryRouter>
        <ProductList
          products={products}
          onAddToCart={mockAddToCart}
        />
      </MemoryRouter>
    )
  }

  it('renders all products', () => {
    renderList()

    expect(screen.getByText('Product 1')).toBeDefined()
    expect(screen.getByText('Product 2')).toBeDefined()
  })

  it('renders empty list when no products', () => {
    const { container } = renderList([])

    const productList = container.querySelector('.product-list')
    expect(productList.children.length).toBe(0)
  })

  it('passes correct props to ProductCard', () => {
    renderList()

    const addToCartButtons = screen.getAllByText('Add to Cart')
    expect(addToCartButtons.length).toBe(2)
  })

  it('renders the Dark Factory footer line with the exact story copy', () => {
    render(
      <MemoryRouter>
        <ProductList
          products={[{ id: '1', name: 'Test Item', price: 10 }]}
          onAddToCart={vi.fn()}
        />
      </MemoryRouter>
    )

    const footer = screen.getByText(
      'Built by the Dark Factory - by the Developer Agent'
    )
    expect(footer).toBeDefined()
    expect(footer.classList.contains('product-list-footer')).toBe(true)
  })

  it('styles the footer line in italics via .product-list-footer', () => {
    const withoutComments = cssText.replace(/\/\*[\s\S]*?\*\//g, ' ')
    expect(withoutComments).toMatch(
      /\.product-list-footer\s*\{[^}]*font-style:\s*italic/i
    )
  })

  it('still renders every product card passed to it', () => {
    renderList([
      {
        id: '1',
        name: 'Alpha Item',
        slug: 'alpha-item',
        description: 'Description Alpha',
        price: 10,
        image: null,
        category: 'Category A',
      },
      {
        id: '2',
        name: 'Beta Item',
        slug: 'beta-item',
        description: 'Description Beta',
        price: 20,
        image: null,
        category: 'Category B',
      },
    ])

    expect(screen.getByText('Alpha Item')).toBeDefined()
    expect(screen.getByText('Beta Item')).toBeDefined()
  })
})
