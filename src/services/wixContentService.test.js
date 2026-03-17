import { describe, it, expect, vi, beforeEach } from 'vitest'
import { fetchCollection, fetchAboutUs } from '../services/wixContentService'

// Mock the @wix/sdk and @wix/data modules
vi.mock('@wix/sdk', () => ({
  createClient: vi.fn(),
  OAuthStrategy: vi.fn(() => ({ type: 'oauth' })),
}))

vi.mock('@wix/data', () => ({
  items: { query: vi.fn() },
}))

import { createClient } from '@wix/sdk'

const mockItems = [
  { _id: '1', ownerName: 'Jane Doe', ownerBio: '<p>We love antiques.</p>' },
  { _id: '2', ownerName: 'John Smith', ownerBio: '<p>Meet the team.</p>' },
]

function makeFakeClient(resolvedItems) {
  return {
    items: {
      query: vi.fn().mockReturnValue({
        find: vi.fn().mockResolvedValue({ items: resolvedItems }),
      }),
    },
  }
}

describe('wixContentService', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('VITE_WIX_CONTENT_CLIENT_ID', 'test-client-id')
  })

  describe('fetchCollection', () => {
    it('returns items from a collection', async () => {
      const fakeClient = makeFakeClient(mockItems)
      createClient.mockReturnValue(fakeClient)

      const result = await fetchCollection('AboutUs')

      expect(fakeClient.items.query).toHaveBeenCalledWith('AboutUs')
      expect(result).toEqual([
        { _id: '1', ownerName: 'Jane Doe', ownerBio: '<p>We love antiques.</p>' },
        { _id: '2', ownerName: 'John Smith', ownerBio: '<p>Meet the team.</p>' },
      ])
    })

    it('returns empty array when collection has no items', async () => {
      const fakeClient = makeFakeClient([])
      createClient.mockReturnValue(fakeClient)

      const result = await fetchCollection('EmptyCollection')

      expect(result).toEqual([])
    })

    it('throws and logs error when the API call fails', async () => {
      const fakeClient = {
        items: {
          query: vi.fn().mockReturnValue({
            find: vi.fn().mockRejectedValue(new Error('Network error')),
          }),
        },
      }
      createClient.mockReturnValue(fakeClient)
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      await expect(fetchCollection('AboutUs')).rejects.toThrow('Network error')
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('"AboutUs"'),
        expect.any(Error)
      )

      consoleSpy.mockRestore()
    })

    it('throws when VITE_WIX_CONTENT_CLIENT_ID is not set', async () => {
      vi.stubEnv('VITE_WIX_CONTENT_CLIENT_ID', '')

      await expect(fetchCollection('AboutUs')).rejects.toThrow(
        'VITE_WIX_CONTENT_CLIENT_ID is not configured'
      )
    })
  })

  describe('fetchAboutUs', () => {
    it('queries the AboutUs collection', async () => {
      const fakeClient = makeFakeClient(mockItems)
      createClient.mockReturnValue(fakeClient)

      await fetchAboutUs()

      expect(fakeClient.items.query).toHaveBeenCalledWith('AboutUs')
    })

    it('returns the same shape as fetchCollection("AboutUs")', async () => {
      const fakeClient = makeFakeClient(mockItems)
      createClient.mockReturnValue(fakeClient)

      const result = await fetchAboutUs()

      expect(Array.isArray(result)).toBe(true)
      expect(result[0]).toHaveProperty('ownerName')
      expect(result[0]).toHaveProperty('ownerBio')
    })
  })
})
