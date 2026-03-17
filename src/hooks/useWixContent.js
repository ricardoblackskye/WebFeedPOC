import { useState, useEffect } from 'react'

/**
 * Generic hook for fetching content from a Wix CMS collection.
 *
 * @param {Function} fetchFn - Async function that returns an array of items
 * @returns {{ data: Object[], loading: boolean, error: string|null }}
 */
export function useWixContent(fetchFn) {
  const [data, setData] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    let cancelled = false

    async function loadContent() {
      setLoading(true)
      setError(null)

      try {
        const result = await fetchFn()
        if (!cancelled) {
          setData(result)
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Failed to load CMS content:', err.message)
          setError(err.message)
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    loadContent()

    return () => {
      cancelled = true
    }
  }, [fetchFn])

  return { data, loading, error }
}
