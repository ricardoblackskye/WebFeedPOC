import { describe, it, expect } from 'vitest'
import {
  createProductFixture,
  createCartFixture,
  createWixCartLineItemFixture,
  createWixCartFixture,
  createContentFixture
} from './copyPasteHelpers'

describe('createProductFixture', () => {
  it('returns default values when no overrides', () => {
    const product = createProductFixture()
    expect(product).toEqual({
      id: 'product-1',
      name: 'Test product',
      price: 100
    })
  })

  it('merges overrides with defaults', () => {
    const product = createProductFixture({ name: 'Custom product' })
    expect(product.name).toBe('Custom product')
    expect(product.id).toBe('product-1')
    expect(product.price).toBe(100)
  })

  it('merges multiple overrides', () => {
    const product = createProductFixture({ id: 'custom-id', price: 250 })
    expect(product.id).toBe('custom-id')
    expect(product.name).toBe('Test product')
    expect(product.price).toBe(250)
  })

  it('accepts empty overrides object', () => {
    const product = createProductFixture({})
    expect(product).toEqual({
      id: 'product-1',
      name: 'Test product',
      price: 100
    })
  })
})

describe('createCartFixture', () => {
  it('returns default values when no overrides', () => {
    const cart = createCartFixture()
    expect(cart).toEqual({
      id: 'cart-1',
      lineItems: []
    })
  })

  it('merges overrides with defaults', () => {
    const cart = createCartFixture({ id: 'cart-2' })
    expect(cart.id).toBe('cart-2')
    expect(cart.lineItems).toEqual([])
  })
})

describe('createWixCartLineItemFixture', () => {
  it('returns default values when no overrides', () => {
    const item = createWixCartLineItemFixture()
    expect(item._id).toBe('line-1')
    expect(item.catalogReference).toEqual({ catalogItemId: 'product-1' })
    expect(item.productName).toEqual({ original: 'Test product' })
    expect(item.price).toEqual({ amount: 100 })
    expect(item.quantity).toBe(1)
  })

  it('merges overrides with defaults', () => {
    const item = createWixCartLineItemFixture({ quantity: 3 })
    expect(item.quantity).toBe(3)
    expect(item._id).toBe('line-1')
  })

  it('overrides nested objects entirely', () => {
    const item = createWixCartLineItemFixture({
      productName: { original: 'Custom product' }
    })
    expect(item.productName.original).toBe('Custom product')
    expect(item.price.amount).toBe(100)
  })
})

describe('createWixCartFixture', () => {
  it('returns default values when no overrides', () => {
    const cart = createWixCartFixture()
    expect(cart).toEqual({
      lineItems: []
    })
  })

  it('merges overrides with defaults', () => {
    const cart = createWixCartFixture({
      lineItems: [
        { _id: 'line-1', catalogReference: { catalogItemId: 'product-1' }, productName: { original: 'Test' }, price: { amount: 50 }, quantity: 1 }
      ]
    })
    expect(cart.lineItems).toHaveLength(1)
    expect(cart.lineItems[0]._id).toBe('line-1')
  })
})

describe('createContentFixture', () => {
  it('returns default values when no overrides', () => {
    const content = createContentFixture()
    expect(content).toEqual({
      _id: 'content-1',
      title: 'Our Story',
      body: 'We love antiques.'
    })
  })

  it('merges overrides with defaults', () => {
    const content = createContentFixture({ title: 'About Us' })
    expect(content.title).toBe('About Us')
    expect(content._id).toBe('content-1')
    expect(content.body).toBe('We love antiques.')
  })

  it('overrides body field', () => {
    const content = createContentFixture({ body: 'New body text.' })
    expect(content.body).toBe('New body text.')
    expect(content.title).toBe('Our Story')
  })
})