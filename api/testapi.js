/**
 * Test API Route
 * Returns a 200 response with basic JSON payload
 *
 * This endpoint:
 * 1. Accepts GET requests at /testapi
 * 2. Returns a 200 OK with a simple JSON body
 */

export default function handler(req, res) {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  return res.status(200).json({
    success: true,
    message: 'TestAPI is working',
    timestamp: new Date().toISOString(),
    version: '1.0.0',
  })
}
