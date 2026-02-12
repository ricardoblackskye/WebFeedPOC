import { describe, it, expect } from 'vitest'
import { formatPrice, isValidEmail, generateId } from '../utils/helpers'

describe('formatPrice', () => {
  it('formats price correctly', () => {
    expect(formatPrice(100)).toBe('$100.00')
    expect(formatPrice(99.99)).toBe('$99.99')
    expect(formatPrice(0)).toBe('$0.00')
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
