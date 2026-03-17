import { useQuery } from '@tanstack/react-query'

/**
 * Generic hook for fetching content from a Wix CMS collection.
 * Results are cached by function name — navigating away and back within the
 * stale window serves the cached result instantly without a network round-trip.
 *
 * @param {Function} fetchFn - Named async function that returns an array of items
 * @returns {{ data: Object[], loading: boolean, refreshing: boolean, error: string|null }}
 */
export function useWixContent(fetchFn) {
  const { data, isPending, isFetching, error } = useQuery({
    queryKey: ['wix-content', fetchFn.name],
    queryFn: fetchFn,
    staleTime: 10 * 60 * 1000,
  })

  return {
    data: data ?? [],
    loading: isPending,
    refreshing: isFetching && !isPending,
    error: error?.message ?? null,
  }
}
