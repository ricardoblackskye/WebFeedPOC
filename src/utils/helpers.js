/**
 * Formats a price value to display format
 */
export function formatPrice(price) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP',
  }).format(price)
}

/**
 * Validates email format
 */
export function isValidEmail(email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generates a unique ID
 */
export function generateId() {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Strips HTML tags from a string and decodes HTML entities, returning plain text
 */
export function stripHtml(html) {
  if (!html) return ''
  
  // Remove HTML tags
  let text = html.replace(/<[^>]*>/g, '')
  
  // Decode HTML entities using a temporary DOM element
  const textarea = document.createElement('textarea')
  textarea.innerHTML = text
  text = textarea.value
  
  // Clean up extra whitespace
  return text.replace(/\s+/g, ' ').trim()
}
