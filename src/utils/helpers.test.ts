import { describe, it, expect } from 'vitest'
import { formatPrice, isValidEmail, generateId, stripHtml, truncateWords } from './helpers'

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

  it('strips and decodes HTML without a browser document', () => {
    const originalDocument = globalThis.document
    try {
      // test intentionally removes the browser global to exercise Node path
      delete (globalThis as Partial<typeof globalThis>).document
      expect(stripHtml('<p>Hello&nbsp;&amp; goodbye</p>')).toBe('Hello & goodbye')
    } finally {
      globalThis.document = originalDocument
    }
  })
})

describe('truncateWords', () => {
  it('truncates text to specified number of words', () => {
    const text = 'one two three four five six seven eight nine ten'
    expect(truncateWords(text, 5)).toBe('one two three four five...')
  })

  it('handles short text', () => {
    expect(truncateWords('short text', 5)).toBe('short text')
  })

  it('handles empty or null input', () => {
    expect(truncateWords('')).toBe('')
    expect(truncateWords(null)).toBe('')
    expect(truncateWords(undefined)).toBe('')
  })

  it('defaults to 50 words', () => {
    const words = Array(60).fill('word').join(' ')
    const result = truncateWords(words)
    const resultWords = result.replace('...', '').trim().split(' ')
    expect(resultWords.length).toBe(50)
  })
})