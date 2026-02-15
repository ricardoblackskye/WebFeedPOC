import crypto from 'node:crypto'

/**
 * Vercel Serverless Function — Wix Webhook Receiver
 *
 * Wix sends a POST here when products are created, updated, or deleted.
 * This function validates the webhook, then triggers a Vercel deploy hook
 * to rebuild the site with fresh data.
 *
 * Required env vars (set in Vercel dashboard):
 *   VERCEL_DEPLOY_HOOK_URL  — Your Vercel deploy hook URL
 *   WIX_WEBHOOK_SECRET      — The secret key from your Wix webhook config
 *
 * Wix webhook setup:
 *   1. Go to your Wix Dashboard → Developer Tools → Webhooks
 *   2. Create a webhook for "Product Created", "Product Updated", "Product Deleted"
 *   3. Set the URL to: https://your-site.vercel.app/api/wix-webhook
 *   4. Copy the webhook secret into your Vercel env vars as WIX_WEBHOOK_SECRET
 */

// Rate limiting: don't trigger more than one rebuild per minute
let lastTriggerTime = 0
const MIN_INTERVAL_MS = 60_000

export default async function handler(req, res) {
  // Only accept POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  // Verify required env vars
  const deployHookUrl = process.env.VERCEL_DEPLOY_HOOK_URL
  const webhookSecret = process.env.WIX_WEBHOOK_SECRET

  if (!deployHookUrl) {
    console.error('VERCEL_DEPLOY_HOOK_URL not configured')
    return res.status(500).json({ error: 'Deploy hook not configured' })
  }

  // Validate Wix webhook signature (if secret is configured)
  if (webhookSecret) {
    const signature = req.headers['x-wix-signature']

    if (!signature) {
      console.warn('Webhook received without signature')
      return res.status(401).json({ error: 'Missing signature' })
    }

    const body = typeof req.body === 'string' ? req.body : JSON.stringify(req.body)
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body)
      .digest('hex')

    if (signature !== expectedSignature) {
      console.warn('Webhook signature mismatch')
      return res.status(401).json({ error: 'Invalid signature' })
    }
  }

  // Rate limiting — prevent rapid successive rebuilds
  const now = Date.now()
  if (now - lastTriggerTime < MIN_INTERVAL_MS) {
    console.log('Deploy hook rate-limited — skipping (last trigger was less than 60s ago)')
    return res.status(200).json({
      message: 'Rebuild already queued recently — skipping',
      nextAvailableIn: `${Math.ceil((MIN_INTERVAL_MS - (now - lastTriggerTime)) / 1000)}s`,
    })
  }

  // Log the event type for debugging
  const eventType = req.body?.eventType || req.body?.data?.eventType || 'unknown'
  console.log(`Wix webhook received: ${eventType}`)

  // Trigger the Vercel deploy hook
  try {
    const response = await fetch(deployHookUrl, { method: 'POST' })

    if (!response.ok) {
      const text = await response.text()
      console.error(`Deploy hook failed: ${response.status} ${text}`)
      return res.status(502).json({ error: 'Failed to trigger deploy' })
    }

    lastTriggerTime = now
    console.log(`Deploy triggered successfully for event: ${eventType}`)

    return res.status(200).json({
      message: 'Rebuild triggered',
      event: eventType,
      timestamp: new Date().toISOString(),
    })
  } catch (err) {
    console.error('Deploy hook error:', err.message)
    return res.status(502).json({ error: 'Failed to trigger deploy' })
  }
}
