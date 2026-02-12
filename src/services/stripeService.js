/**
 * Creates a Stripe checkout session
 * Note: This requires a backend server endpoint
 */
export async function createCheckoutSession(items) {
  try {
    const response = await fetch('/api/create-checkout-session', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        items: items.map(item => ({
          name: item.name,
          price: item.price,
          quantity: item.quantity,
        })),
      }),
    })

    if (!response.ok) {
      throw new Error('Failed to create checkout session')
    }

    return await response.json()
  } catch (error) {
    console.error('Stripe checkout error:', error)
    throw error
  }
}

/**
 * Formats price for Stripe (converts to cents)
 */
export function formatPriceForStripe(price) {
  return Math.round(price * 100)
}
