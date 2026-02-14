import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useWixProducts } from '../hooks/useWixProducts'
import * as wixService from '../services/wixService'

vi.mock('../services/wixService')

describe('useWixProducts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading state initially', () => {
    vi.spyOn(wixService, 'fetchWixProducts').mockImplementation(
      () => new Promise(() => {}) // Never resolves
    )

    const { result } = renderHook(() => useWixProducts())

    expect(result.current.loading).toBe(true)
    expect(result.current.products).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('returns products on successful fetch', async () => {
    const mockProducts = [
      { id: '1', name: 'Product 1', price: 100 },
      { id: '2', name: 'Product 2', price: 200 },
    ]

    vi.spyOn(wixService, 'fetchWixProducts').mockResolvedValue(mockProducts)

    const { result } = renderHook(() => useWixProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products).toEqual(mockProducts)
    expect(result.current.error).toBeNull()
  })

  it('returns mock products on error', async () => {
    vi.spyOn(wixService, 'fetchWixProducts').mockRejectedValue(
      new Error('API Error')
    )

    const { result } = renderHook(() => useWixProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.products.length).toBeGreaterThan(0)
    expect(result.current.error).toBe('API Error')
  })

  it('mock products have required fields', async () => {
    vi.spyOn(wixService, 'fetchWixProducts').mockRejectedValue(
      new Error('No API')
    )

    const { result } = renderHook(() => useWixProducts())

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    const product = result.current.products[0]
    expect(product).toHaveProperty('id')
    expect(product).toHaveProperty('name')
    expect(product).toHaveProperty('slug')
    expect(product).toHaveProperty('description')
    expect(product).toHaveProperty('price')
    expect(product).toHaveProperty('category')
  })

  it('sets loading to false after fetch completes', async () => {
    vi.spyOn(wixService, 'fetchWixProducts').mockResolvedValue([])

    const { result } = renderHook(() => useWixProducts())

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })
})
