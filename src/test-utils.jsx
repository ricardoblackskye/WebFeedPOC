import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import PropTypes from 'prop-types'

/**
 * Wraps a component in MemoryRouter for testing components that use Links/routing
 */
export function RouterWrapper({ children, initialEntries = ['/'] }) {
  return (
    <HelmetProvider>
      <MemoryRouter initialEntries={initialEntries}>
        {children}
      </MemoryRouter>
    </HelmetProvider>
  )
}

RouterWrapper.propTypes = {
  children: PropTypes.node.isRequired,
  initialEntries: PropTypes.arrayOf(PropTypes.string),
}

/**
 * Creates a wrapper function for @testing-library/react's render
 */
export function createRouterWrapper(initialEntries = ['/']) {
  function Wrapper({ children }) {
    return (
      <HelmetProvider>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </HelmetProvider>
    )
  }
  Wrapper.propTypes = { children: PropTypes.node.isRequired }
  return Wrapper
}

/**
 * Creates a wrapper with a fresh QueryClient for each test.
 * Required for renderHook calls that use TanStack Query hooks.
 */
export function createQueryWrapper() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        retry: false,
        staleTime: Infinity,
      },
    },
  })
  function Wrapper({ children }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    )
  }
  Wrapper.propTypes = { children: PropTypes.node.isRequired }
  return Wrapper
}
