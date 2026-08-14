import { describe, it, expect, vi, beforeEach } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { useWixContent } from '../hooks/useWixContent'
import { createQueryWrapper } from '../test-utils'
import { createContentFixture } from '../test-utils/copyPasteHelpers'

describe('useWixContent', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns loading state initially', () => {
    const fetchFn = vi.fn(() => new Promise(() => {})) // never resolves

    const { result } = renderHook(() => useWixContent(fetchFn), { wrapper: createQueryWrapper() })

    expect(result.current.loading).toBe(true)
    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })

  it('returns data on successful fetch', async () => {
    const mockData = [
      createContentFixture({ _id: '1' }),
      createContentFixture({ _id: '2', title: 'Our Team', body: 'Meet the team.' }),
    ]
    const fetchFn = vi.fn().mockResolvedValue(mockData)

    const { result } = renderHook(() => useWixContent(fetchFn), { wrapper: createQueryWrapper() })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual(mockData)
    expect(result.current.error).toBeNull()
  })

  it('sets loading to false after fetch completes', async () => {
    const fetchFn = vi.fn().mockResolvedValue([])

    const { result } = renderHook(() => useWixContent(fetchFn), { wrapper: createQueryWrapper() })

    expect(result.current.loading).toBe(true)

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })
  })

  it('sets error and keeps data empty on fetch failure', async () => {
    const fetchFn = vi.fn().mockRejectedValue(new Error('API unavailable'))

    const { result } = renderHook(() => useWixContent(fetchFn), { wrapper: createQueryWrapper() })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.error).toBe('API unavailable')
    expect(result.current.data).toEqual([])
  })

  it('calls fetchFn once on mount', async () => {
    const fetchFn = vi.fn().mockResolvedValue([])

    renderHook(() => useWixContent(fetchFn), { wrapper: createQueryWrapper() })

    await waitFor(() => {
      expect(fetchFn).toHaveBeenCalledTimes(1)
    })
  })

  it('returns empty data array when fetch resolves with empty array', async () => {
    const fetchFn = vi.fn().mockResolvedValue([])

    const { result } = renderHook(() => useWixContent(fetchFn), { wrapper: createQueryWrapper() })

    await waitFor(() => {
      expect(result.current.loading).toBe(false)
    })

    expect(result.current.data).toEqual([])
    expect(result.current.error).toBeNull()
  })
})
