import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { queryOrders, transformOrder } from '../services/wixCheckoutService'
import './OrderHistory.css'

/**
 * Order History Page
 * Shows list of orders for the current member
 * Requires member authentication
 */
export default function OrderHistory() {
  const [orders, setOrders] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [totalCount, setTotalCount] = useState(0)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await queryOrders({ limit: 20, offset: 0 })
      const transformedOrders = result.orders.map(order => transformOrder(order))
      
      setOrders(transformedOrders)
      setTotalCount(result.totalCount)
    } catch (err) {
      console.error('Failed to load orders:', err)
      setError('Unable to load order history. Please sign in to view your orders.')
    } finally {
      setLoading(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    if (!status) return 'status-unknown'
    const statusLower = status.toLowerCase()
    if (statusLower === 'paid' || statusLower === 'fulfilled') return 'status-success'
    if (statusLower === 'pending' || statusLower === 'not_fulfilled') return 'status-pending'
    if (statusLower === 'refunded' || statusLower === 'canceled') return 'status-canceled'
    return 'status-unknown'
  }

  if (loading) {
    return (
      <div className="order-history">
        <h1>Order History</h1>
        <div className="order-history-loading">
          <div className="spinner"></div>
          <p>Loading your orders...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="order-history">
        <h1>Order History</h1>
        <div className="order-history-error">
          <p>{error}</p>
          <Link to="/" className="btn-primary">Return to Home</Link>
        </div>
      </div>
    )
  }

  if (orders.length === 0) {
    return (
      <div className="order-history">
        <h1>Order History</h1>
        <div className="order-history-empty">
          <p>You haven't placed any orders yet.</p>
          <Link to="/" className="btn-primary">Start Shopping</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="order-history">
      <h1>Order History</h1>
      <p className="order-count">{totalCount} {totalCount === 1 ? 'order' : 'orders'} found</p>

      <div className="orders-list">
        {orders.map((order) => (
          <div key={order.id} className="order-card">
            <div className="order-card-header">
              <div>
                <h3>Order #{order.number}</h3>
                <p className="order-date">
                  {new Date(order.createdDate).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
              </div>
              <div className="order-badges">
                <span className={`status-badge ${getStatusBadgeClass(order.paymentStatus)}`}>
                  {order.paymentStatus || 'Pending'}
                </span>
                <span className={`status-badge ${getStatusBadgeClass(order.fulfillmentStatus)}`}>
                  {order.fulfillmentStatus || 'Processing'}
                </span>
              </div>
            </div>

            <div className="order-card-body">
              <div className="order-items-summary">
                {order.items.slice(0, 3).map((item) => (
                  <div key={item.id} className="order-item-mini">
                    {item.image && (
                      <img src={item.image} alt={item.name} />
                    )}
                    <div className="order-item-mini-details">
                      <p className="item-name">{item.name}</p>
                      <p className="item-quantity">Qty: {item.quantity}</p>
                    </div>
                  </div>
                ))}
                {order.items.length > 3 && (
                  <p className="more-items">+{order.items.length - 3} more items</p>
                )}
              </div>

              <div className="order-card-footer">
                <div className="order-total">
                  <span>Total:</span>
                  <strong>${order.total.toFixed(2)}</strong>
                </div>
                <Link 
                  to={`/order-confirmation?orderId=${order.id}`}
                  className="btn-view-order"
                >
                  View Details
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
