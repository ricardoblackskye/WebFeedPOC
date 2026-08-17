/**
 * Formats a price value to display format
 */
export function formatPrice (price) {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency: 'GBP'
  }).format(price)
}

/**
 * Validates email format
 */
export function isValidEmail (email) {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Generates a unique ID
 */
export function generateId () {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`
}

/**
 * Strips HTML tags from a string and decodes HTML entities, returning plain text
 */
export function stripHtml (html) {
  if (!html) return ''

  // Remove HTML tags
  let text = html.replaceAll(/<[^>]*>/g, '')

  // Decode entities without requiring a browser DOM so SSR/prerender can run in Node.
  if (typeof document !== 'undefined') {
    const textarea = document.createElement('textarea')
    textarea.innerHTML = text
    text = textarea.value
  } else {
    text = text
      .replaceAll(/&nbsp;/gi, ' ')
      .replaceAll(/&amp;/gi, '&')
      .replaceAll(/&lt;/gi, '<')
      .replaceAll(/&gt;/gi, '>')
      .replaceAll(/&quot;/gi, '"')
      .replaceAll(/&#39;|&apos;/gi, "'")
      .replaceAll(/&#(\d+);/g, (_, code) => String.fromCodePoint(Number(code)))
      .replaceAll(/&#x([\da-f]+);/gi, (_, code) => String.fromCodePoint(parseInt(code, 16)))
  }

  // Clean up extra whitespace
  return text.replaceAll(/\s+/g, ' ').trim()
}

/**
 * Generates a URL-friendly slug from a string
 */
export function generateSlug (text) {
  if (!text) return ''
  return text
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, '-')
    .replaceAll(/^-+|-+$/g, '')
}

/**
 * Truncates text to a specified number of words
 */
export function truncateWords (text, maxWords = 50) {
  if (!text) return ''
  const words = text.split(/\s+/)
  if (words.length <= maxWords) return text
  return words.slice(0, maxWords).join(' ') + '...'
}
