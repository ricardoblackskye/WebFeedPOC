import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import StockIndicator from './StockIndicator'

describe('StockIndicator', () => {
  it('shows "In Stock" when inventory tracking is disabled', () => {
    const stock = {
      trackInventory: false,
      quantity: 0,
      inStock: true,
    }

    render(<StockIndicator stock={stock} />)
    
    expect(screen.getByText('In Stock')).toBeInTheDocument()
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('shows "Out of Stock" when quantity is 0', () => {
    const stock = {
      trackInventory: true,
      quantity: 0,
      inStock: false,
    }

    render(<StockIndicator stock={stock} />)
    
    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
    expect(screen.getByText('✕')).toBeInTheDocument()
  })

  it('shows "Out of Stock" when inStock is false', () => {
    const stock = {
      trackInventory: true,
      quantity: 5,
      inStock: false,
    }

    render(<StockIndicator stock={stock} />)
    
    expect(screen.getByText('Out of Stock')).toBeInTheDocument()
  })

  it('shows low stock warning when quantity <= 5', () => {
    const stock = {
      trackInventory: true,
      quantity: 3,
      inStock: true,
    }

    render(<StockIndicator stock={stock} />)
    
    expect(screen.getByText('Only 3 left in stock')).toBeInTheDocument()
    expect(screen.getByText('⚠')).toBeInTheDocument()
  })

  it('shows stock available with quantity when > 5', () => {
    const stock = {
      trackInventory: true,
      quantity: 10,
      inStock: true,
    }

    render(<StockIndicator stock={stock} />)
    
    expect(screen.getByText('In Stock (10 available)')).toBeInTheDocument()
    expect(screen.getByText('✓')).toBeInTheDocument()
  })

  it('renders nothing when stock is null', () => {
    const { container } = render(<StockIndicator stock={null} />)
    
    expect(container.firstChild).toBeNull()
  })

  it('applies custom className', () => {
    const stock = {
      trackInventory: false,
      quantity: 0,
      inStock: true,
    }

    const { container } = render(<StockIndicator stock={stock} className="custom-class" />)
    
    expect(container.querySelector('.custom-class')).toBeInTheDocument()
  })

  it('shows low stock for quantity = 5 (boundary)', () => {
    const stock = {
      trackInventory: true,
      quantity: 5,
      inStock: true,
    }

    render(<StockIndicator stock={stock} />)
    
    expect(screen.getByText('Only 5 left in stock')).toBeInTheDocument()
  })

  it('shows normal stock for quantity = 6 (boundary)', () => {
    const stock = {
      trackInventory: true,
      quantity: 6,
      inStock: true,
    }

    render(<StockIndicator stock={stock} />)
    
    expect(screen.getByText('In Stock (6 available)')).toBeInTheDocument()
  })
})
