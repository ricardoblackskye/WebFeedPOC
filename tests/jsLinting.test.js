import { describe, it, expect } from 'vitest'
import { execSync } from 'child_process'

describe('JS Standard linting should pass for Wix and Stripe related files', () => {
  const files = [
    'src/hooks/useWixCart.js',
    'src/hooks/useWixContent.js',
    'src/hooks/useWixProducts.js',
    'src/services/stripeService.js',
    'src/services/stripeService.test.js'
  ]

  it('should have no linting errors', () => {
    // This will throw if there are linting errors
    execSync(`npx standard ${files.join(' ')}`, { encoding: 'utf8' })
  })
})
