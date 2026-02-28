import { describe, it, expect, beforeEach, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import Cart from '../components/Cart'

// Mock Wix checkout service
vi.mock('../services/wixCheckoutService', () => ({
  initiateCheckout: vi.fn(() => Promise.resolve('https://checkout.wix.com/test')),
}))

describe('Cart', () => {
  const mockUpdateQuantity = vi.fn()
  const mockRemoveItem = vi.fn()

  beforeEach(() => {
    mockUpdateQuantity.mockClear()
    mockRemoveItem.mockClear()
  })

  it('displays empty cart message when no items', () => {
    render(
      <Cart
        items={[]}
        onUpdateQuantity={mockUpdateQuantity}
        onRemoveItem={mockRemoveItem}
        totalPrice={0}
      />
    )

    expect(screen.getByText('Your cart is empty')).toBeDefined()
  })

  it('displays cart items correctly', () => {
    const items = [
      { id: '1', name: 'Item 1', price: 100, quantity: 2 },
      { id: '2', name: 'Item 2', price: 50, quantity: 1 },
    ]

    render(
      <Cart
        items={items}
        onUpdateQuantity={mockUpdateQuantity}
        onRemoveItem={mockRemoveItem}
        totalPrice={250}
      />
    )

    expect(screen.getByText('Item 1')).toBeDefined()
    expect(screen.getByText('Item 2')).toBeDefined()
    expect(screen.getByText('Total: £250.00')).toBeDefined()
  })

  it('calls onUpdateQuantity when quantity buttons clicked', () => {
    const items = [
      { id: '1', name: 'Item 1', price: 100, quantity: 2 },
    ]

    render(
      <Cart
        items={items}
        onUpdateQuantity={mockUpdateQuantity}
        onRemoveItem={mockRemoveItem}
        totalPrice={200}
      />
    )

    const plusButtons = screen.getAllByText('+')
    const minusButtons = screen.getAllByText('-')

    fireEvent.click(plusButtons[0])
    expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 3)

    fireEvent.click(minusButtons[0])
    expect(mockUpdateQuantity).toHaveBeenCalledWith('1', 1)
  })

  it('calls onRemoveItem when remove button clicked', () => {
    const items = [
      { id: '1', name: 'Item 1', price: 100, quantity: 2 },
    ]

    render(
      <Cart
        items={items}
        onUpdateQuantity={mockUpdateQuantity}
        onRemoveItem={mockRemoveItem}
        totalPrice={200}
      />
    )

    const removeButton = screen.getByText('Remove')
    fireEvent.click(removeButton)

    expect(mockRemoveItem).toHaveBeenCalledWith('1')
  })

  it('displays correct quantity for each item', () => {
    const items = [
      { id: '1', name: 'Item 1', price: 100, quantity: 3 },
    ]

    render(
      <Cart
        items={items}
        onUpdateQuantity={mockUpdateQuantity}
        onRemoveItem={mockRemoveItem}
        totalPrice={300}
      />
    )

    expect(screen.getByText('3')).toBeDefined()
  })

  it('shows checkout button when items exist', () => {
    const items = [
      { id: '1', name: 'Item 1', price: 100, quantity: 1 },
    ]

    render(
      <Cart
        items={items}
        onUpdateQuantity={mockUpdateQuantity}
        onRemoveItem={mockRemoveItem}
        totalPrice={100}
      />
    )

    expect(screen.getByText('Proceed to Checkout')).toBeDefined()
  })
})
