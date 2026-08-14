export function createProductFixture(overrides = {}) {
  return {
    id: 'product-1',
    name: 'Test product',
    price: 100,
    ...overrides,
  };
}

export function createCartFixture(overrides = {}) {
  return {
    id: 'cart-1',
    lineItems: [],
    ...overrides,
  };
}

export function createWixCartLineItemFixture(overrides = {}) {
  return {
    _id: 'line-1',
    catalogReference: { catalogItemId: 'product-1' },
    productName: { original: 'Test product' },
    price: { amount: 100 },
    quantity: 1,
    ...overrides,
  };
}

export function createWixCartFixture(overrides = {}) {
  return {
    lineItems: [],
    ...overrides,
  };
}

export function createContentFixture(overrides = {}) {
  return {
    _id: 'content-1',
    title: 'Our Story',
    body: 'We love antiques.',
    ...overrides,
  };
}
