import { describe, it, expect, vi, afterEach } from 'vitest'
import React from 'react'
import { render, screen, cleanup } from '@testing-library/react'
import { HelmetProvider } from 'react-helmet-async'

vi.mock('react-router-dom', () => ({
  useOutletContext: () => ({
    products: [],
    loading: false,
    error: null,
    categories: [],
    productCounts: { All: 0 },
    addToCart: vi.fn()
  }),
  useSearchParams: () => [new URLSearchParams(), vi.fn()]
}))

import HomePage from './HomePage'

afterEach(() => {
  cleanup()
})

describe('HomePage', () => {
  it('renders the Dark Factory credit line on the home page', () => {
    render(
      <HelmetProvider>
        <HomePage />
      </HelmetProvider>
    )
    const line = screen.getByText('Built by the Dark Factory')
    expect(line).toBeDefined()
  })

  it('renders the credit line inside an <em> element', () => {
    render(
      <HelmetProvider>
        <HomePage />
      </HelmetProvider>
    )
    const line = screen.getByText('Built by the Dark Factory')
    expect(line.tagName).toBe('EM')
    expect(line.closest('.home-footer')).not.toBeNull()
  })

  it('still renders the All Items heading with product count unchanged', () => {
    render(
      <HelmetProvider>
        <HomePage />
      </HelmetProvider>
    )
    const heading = screen.getByRole('heading', { level: 2 })
    expect(heading.textContent).toContain('All Items')
    expect(screen.getByText('(0)')).toBeDefined()
  })
})
