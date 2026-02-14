import { describe, it, expect } from 'vitest'
import { formatPrice, isValidEmail, generateId, stripHtml } from '../utils/helpers'

describe('formatPrice', () => {
  it('formats price correctly', () => {
    expect(formatPrice(100)).toBe('£100.00')
    expect(formatPrice(99.99)).toBe('£99.99')
    expect(formatPrice(0)).toBe('£0.00')
  })
})

describe('isValidEmail', () => {
  it('validates email correctly', () => {
    expect(isValidEmail('test@example.com')).toBe(true)
    expect(isValidEmail('invalid')).toBe(false)
    expect(isValidEmail('test@')).toBe(false)
    expect(isValidEmail('@example.com')).toBe(false)
  })
})

describe('generateId', () => {
  it('generates unique IDs', () => {
    const id1 = generateId()
    const id2 = generateId()
    expect(id1).not.toBe(id2)
    expect(typeof id1).toBe('string')
  })
})

describe('stripHtml', () => {
  it('removes HTML tags', () => {
    expect(stripHtml('<p>Hello world</p>')).toBe('Hello world')
    expect(stripHtml('<div><span>Test</span></div>')).toBe('Test')
  })

  it('decodes HTML entities', () => {
    expect(stripHtml('Hello&nbsp;world')).toBe('Hello world')
    expect(stripHtml('Test&amp;demo')).toBe('Test&demo')
    expect(stripHtml('&lt;tag&gt;')).toBe('<tag>')
  })

  it('removes tags and decodes entities together', () => {
    expect(stripHtml('<p>Hello&nbsp;world</p>')).toBe('Hello world')
    expect(stripHtml('<div>Test&nbsp;&nbsp;multiple&nbsp;spaces</div>')).toBe('Test multiple spaces')
  })

  it('handles empty or null input', () => {
    expect(stripHtml('')).toBe('')
    expect(stripHtml(null)).toBe('')
    expect(stripHtml(undefined)).toBe('')
  })

  it('cleans up extra whitespace', () => {
    expect(stripHtml('  Multiple   spaces  ')).toBe('Multiple spaces')
    expect(stripHtml('<p>  Text  with  spaces  </p>')).toBe('Text with spaces')
  })
})
