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
