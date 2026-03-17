import { createClient, OAuthStrategy } from '@wix/sdk'
import { items } from '@wix/data'

/**
 * Creates a Wix headless client for the second (content) site.
 * This is a separate site from the store and uses its own Client ID.
 */
function createContentClient() {
  const clientId = import.meta.env.VITE_WIX_CONTENT_CLIENT_ID

  if (!clientId) {
    throw new Error('VITE_WIX_CONTENT_CLIENT_ID is not configured')
  }

  return createClient({
    modules: { items },
    auth: OAuthStrategy({ clientId }),
  })
}

/**
 * Fetches all items from a named CMS collection.
 *
 * The collectionId must match the internal ID of the collection in
 * the Wix Content Manager (visible in the dashboard URL or collection settings).
 * It is typically the display name in camelCase with spaces removed,
 * e.g. "About Us" → "AboutUs".
 *
 * @param {string} collectionId - The Wix CMS collection ID
 * @returns {Promise<Object[]>} Array of plain data objects (one per item)
 */
export async function fetchCollection(collectionId) {
  const client = createContentClient()

  try {
    const result = await client.items
      .query(collectionId)
      .find()

    // Fields are returned directly on each item (not nested in .data)
    return result.items
  } catch (error) {
    console.error(`Failed to fetch CMS collection "${collectionId}":`, error)
    throw error
  }
}

/**
 * Fetches the "About Us" CMS collection from the content site.
 * Returns an array of about-us content items.
 */
export async function fetchAboutUs() {
  return fetchCollection('AboutUs')
}
