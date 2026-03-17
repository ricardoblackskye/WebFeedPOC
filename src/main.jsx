import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import App from './App.jsx'
import HomePage from './pages/HomePage.jsx'
import ProductPageWrapper from './pages/ProductPageWrapper.jsx'
import CategoryPage from './pages/CategoryPage.jsx'
import OrderConfirmation from './components/OrderConfirmation.jsx'
import OrderHistory from './pages/OrderHistory.jsx'
import AboutPage from './pages/AboutPage.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
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
          </Route>
        </Routes>
      </BrowserRouter>
    </HelmetProvider>
  </React.StrictMode>,
)
