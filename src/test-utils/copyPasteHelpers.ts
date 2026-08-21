export interface ProductFixture {
  id: string
  name: string
  price: number
}

export function createProductFixture<T extends Partial<ProductFixture>>(overrides: T = {} as T): ProductFixture & T {
  return {
    id: 'product-1',
    name: 'Test product',
    price: 100,
    ...overrides
  }
}

export interface CartFixture {
  id: string
  lineItems: unknown[]
}

export function createCartFixture<T extends Partial<CartFixture>>(overrides: T = {} as T): CartFixture & T {
  return {
    id: 'cart-1',
    lineItems: [],
    ...overrides
  }
}

export interface WixCartLineItemFixture {
  _id: string
  catalogReference: { catalogItemId: string }
  productName: { original: string }
  price: { amount: number }
  quantity: number
}

export function createWixCartLineItemFixture<T extends Partial<WixCartLineItemFixture>>(overrides: T = {} as T): WixCartLineItemFixture & T {
  return {
    _id: 'line-1',
    catalogReference: { catalogItemId: 'product-1' },
    productName: { original: 'Test product' },
    price: { amount: 100 },
    quantity: 1,
    ...overrides
  }
}

export interface WixCartFixture {
  lineItems: unknown[]
}

export function createWixCartFixture<T extends Partial<WixCartFixture>>(overrides: T = {} as T): WixCartFixture & T {
  return {
    lineItems: [],
    ...overrides
  }
}

export interface ContentFixture {
  _id: string
  title: string
  body: string
}

export function createContentFixture<T extends Partial<ContentFixture>>(overrides: T = {} as T): ContentFixture & T {
  return {
    _id: 'content-1',
    title: 'Our Story',
    body: 'We love antiques.',
    ...overrides
  }
}