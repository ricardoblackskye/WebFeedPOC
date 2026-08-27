import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import App from './App.jsx'
import HomePage from './pages/HomePage.jsx'
import ProductPageWrapper from './pages/ProductPageWrapper.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import OrderConfirmation from './components/OrderConfirmation.jsx'
import OrderHistory from './pages/OrderHistory.jsx'
import AboutPage from './pages/AboutPage.jsx'
import ArchitecturePage from './pages/ArchitecturePage.jsx'
import ReleasenotesPage from './pages/ReleasenotesPage.jsx'
import './index.css'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,
      retry: 1,
    },
  },
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
    <HelmetProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<HomePage />} />
            <Route path="products/:slug" element={<ProductPageWrapper />} />
            <Route path="category/:categoryName" element={<CategoryPage />} />
            <Route path="order-confirmation" element={<OrderConfirmation />} />
            <Route path="orders" element={<OrderHistory />} />
            <Route path="about" element={<AboutPage />} />
            <Route path="architecture" element={<ArchitecturePage />} />
            <Route path="releasenotes" element={<ReleasenotesPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
    {import.meta.env.DEV && <ReactQueryDevtools initialIsOpen={false} />}
    </QueryClientProvider>
  </React.StrictMode>,
)
