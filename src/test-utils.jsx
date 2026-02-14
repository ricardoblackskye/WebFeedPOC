import { MemoryRouter } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'

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

/**
 * Creates a wrapper function for @testing-library/react's render
 */
export function createRouterWrapper(initialEntries = ['/']) {
  return function Wrapper({ children }) {
    return (
      <HelmetProvider>
        <MemoryRouter initialEntries={initialEntries}>
          {children}
        </MemoryRouter>
      </HelmetProvider>
    )
  }
}
