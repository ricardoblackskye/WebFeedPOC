/**
 * Prerender script — builds the client bundle, then builds an SSR bundle,
 * then renders every route to static HTML for SEO. Also generates sitemap.xml.
 *
 * Usage:  node scripts/prerender.mjs
 */

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { build } from 'vite'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const root = path.resolve(__dirname, '..')
const SITE_URL = 'https://www.antiquesmarketplace.co.uk'

// ── helpers ──────────────────────────────────────────────────────

function writeFile(filePath, content) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, content, 'utf-8')
}

function injectHead(template, head) {
  if (!head) return template

  const headTags = [
    head.title?.toString() || '',
    head.meta?.toString() || '',
    head.link?.toString() || '',
    head.script?.toString() || '',
  ].filter(Boolean).join('\n    ')

  if (!headTags) return template

  // Replace the marked SEO section with Helmet output
  const seoRegex = /<!--seo-head-start-->[\s\S]*?<!--seo-head-end-->/
  if (seoRegex.test(template)) {
    return template.replace(seoRegex, `<!--seo-head-start-->\n    ${headTags}\n    <!--seo-head-end-->`)
  }

  // Fallback: inject before </head>
  return template.replace('</head>', `    ${headTags}\n  </head>`)
}

function generateSitemap(routes) {
  const today = new Date().toISOString().split('T')[0]

  const urls = routes.map(route => {
    let priority, changefreq
    if (route === '/') {
      priority = '1.0'; changefreq = 'daily'
    } else if (route.startsWith('/products/')) {
      priority = '0.8'; changefreq = 'weekly'
    } else {
      priority = '0.6'; changefreq = 'weekly'
    }

    return `  <url>\n    <loc>${SITE_URL}${route}</loc>\n    <lastmod>${today}</lastmod>\n    <changefreq>${changefreq}</changefreq>\n    <priority>${priority}</priority>\n  </url>`
  })

  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.join('\n')}\n</urlset>\n`
}

// ── main ─────────────────────────────────────────────────────────

async function prerender() {
  // Step 1: Build the client bundle
  console.log('\n🔨 Building client bundle…')
  await build({ root })

  // Step 2: Build the SSR bundle
  console.log('\n🔨 Building SSR bundle…')
  await build({
    root,
    build: {
      ssr: path.resolve(root, 'src/entry-server.jsx'),
      outDir: 'dist/server',
      rollupOptions: {
        output: { format: 'esm' },
      },
    },
  })

  // Step 3: Import the SSR bundle
  const serverEntry = path.resolve(root, 'dist/server/entry-server.js')
  const { render, fetchWixProducts } = await import(`file://${serverEntry}`)

  // Step 4: Read the built index.html as template
  const template = fs.readFileSync(
    path.resolve(root, 'dist/index.html'),
    'utf-8'
  )

  // Step 5: Fetch products from Wix
  console.log('\n📦 Fetching products from Wix…')
  let products = []
  try {
    products = await fetchWixProducts()
    console.log(`   Found ${products.length} products`)
  } catch (err) {
    console.warn(`   ⚠️  Could not fetch products: ${err.message}`)
    console.warn('   Prerendering with empty product list — pages will hydrate client-side')
  }

  // Step 6: Determine all routes
  const routes = ['/']
  const categories = [...new Set(products.map(p => p.category).filter(Boolean))].sort((a, b) => a.localeCompare(b))
  products.forEach(p => {
    if (p.slug) routes.push(`/products/${p.slug}`)
  })
  categories.forEach(c => routes.push(`/category/${encodeURIComponent(c)}`))

  console.log(`\n📄 Prerendering ${routes.length} routes…`)

  // Step 7: Render each route
  let successCount = 0
  for (const url of routes) {
    try {
      const { html, head } = render(url, { products })

      let page = template.replace(
        '<div id="root"></div>',
        `<div id="root">${html}</div>`
      )
      page = injectHead(page, head)

      // Determine output path
      const filePath = url === '/'
        ? path.resolve(root, 'dist/index.html')
        : path.resolve(root, `dist${url}/index.html`)

      writeFile(filePath, page)
      successCount++
      console.log(`   ✓ ${url}`)
    } catch (err) {
      console.error(`   ✗ ${url} — ${err.message}`)
    }
  }

  // Step 8: Generate sitemap.xml
  const sitemap = generateSitemap(routes)
  writeFile(path.resolve(root, 'dist/sitemap.xml'), sitemap)
  console.log(`\n🗺️  Generated sitemap.xml with ${routes.length} URLs`)

  // Clean up server build
  fs.rmSync(path.resolve(root, 'dist/server'), { recursive: true, force: true })

  console.log(`\n✅ Prerendering complete — ${successCount}/${routes.length} pages rendered\n`)
}

try {
  await prerender()
} catch (err) {
  console.error('\n❌ Prerender failed:', err)
  process.exit(1)
}
