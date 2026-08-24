import { describe, it } from 'vitest'
import { execSync, type ExecSyncOptions } from 'node:child_process'

describe('JS Standard linting should pass for Wix and Stripe related files', () => {
  const files = [
    'src/hooks/useWixCart.js',
    'src/hooks/useWixContent.js',
    'src/hooks/useWixProducts.js',
    'src/services/stripeService.js',
    'src/services/stripeService.test.js'
  ]

  it('should have no linting errors', { timeout: 30000 }, () => {
    const opts: ExecSyncOptions = { encoding: 'utf8', stdio: ['ignore', 'pipe', 'pipe'] }
    // This will throw if there are linting errors
    execSync(`npx standard ${files.join(' ')}`, opts)
  })
})