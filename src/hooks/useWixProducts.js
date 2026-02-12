import { useState, useEffect } from 'react'
import { fetchWixProducts } from '../services/wixService'

export function useWixProducts() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    async function loadProducts() {
      try {
        setLoading(true)
        const data = await fetchWixProducts()
        setProducts(data)
        setError(null)
      } catch (err) {
        console.log('Wix API not available, using mock data:', err.message)
        setError(err.message)
        // Fallback to mock data if Wix API fails
        setProducts(getMockProducts())
      } finally {
        setLoading(false)
      }
    }

    loadProducts()
  }, [])

  return { products, loading, error }
}

// Mock data for development/testing
function getMockProducts() {
  return [
    {
      id: '1',
      name: 'Victorian Pocket Watch',
      description: 'Stunning 18k gold-plated pocket watch with Roman numerals. Features intricate engraving and original chain. Fully functional mechanical movement from the 1890s.',
      price: 450.00,
      image: 'https://images.unsplash.com/photo-1509048191080-d2984bad6ae5?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-WATCH-001',
      condition: 'Excellent',
      era: 'Victorian (1890s)',
      dimensions: '2" diameter, 0.5" thick',
      material: '18k Gold-plated brass',
      category: 'Timepieces',
    },
    {
      id: '2',
      name: 'Ming Dynasty Porcelain Vase',
      description: 'Authentic hand-painted Chinese porcelain vase, circa 1920. Features traditional blue and white floral patterns. Height: 14 inches. Excellent condition.',
      price: 1850.00,
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-VASE-002',
      condition: 'Excellent - No chips or cracks',
      era: 'Republic Period (1920s)',
      dimensions: '14" H x 6" diameter',
      material: 'Hand-painted porcelain',
      category: 'Ceramics & Pottery',
    },
    {
      id: '3',
      name: 'Art Deco Sunburst Mirror',
      description: 'Gorgeous gilt-wood sunburst mirror in classic Art Deco style. Original brass frame with antiqued patina. Diameter: 32 inches. Perfect statement piece.',
      price: 680.00,
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-MIRROR-003',
      condition: 'Very Good - Original patina',
      era: 'Art Deco (1930s)',
      dimensions: '32" diameter',
      material: 'Gilt wood, beveled glass',
      category: 'Decorative Arts',
    },
    {
      id: '4',
      name: 'Edwardian Oak Writing Desk',
      description: 'Magnificent solid oak writing desk with green leather inlay, circa 1910. Nine drawers with original brass hardware. Perfect for home office. 48"W x 28"D x 30"H.',
      price: 2400.00,
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-DESK-004',
      condition: 'Excellent - Professionally restored',
      era: 'Edwardian (1910)',
      dimensions: '48"W x 28"D x 30"H',
      material: 'Solid oak, leather inlay, brass hardware',
      category: 'Furniture',
    },
    {
      id: '5',
      name: 'Sterling Silver Tea Set',
      description: 'Complete Victorian-era sterling silver tea service. Includes teapot, coffee pot, sugar bowl, and creamer. Hallmarked Birmingham 1895. Total weight: 84 oz.',
      price: 3200.00,
      image: 'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-SILVER-005',
      condition: 'Excellent - Light patina',
      era: 'Victorian (1895)',
      dimensions: 'Teapot: 10" H, Set includes 4 pieces',
      material: 'Sterling silver (84 oz total weight)',
      category: 'Silver & Metalware',
    },
    {
      id: '6',
      name: 'Vintage Illuminated Globe',
      description: 'Beautifully preserved 1960s Replogle globe on turned wooden stand. Internal illumination showcases hand-drawn cartography. Diameter: 12 inches.',
      price: 295.00,
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-GLOBE-006',
      condition: 'Very Good - Working light',
      era: 'Mid-Century (1960s)',
      dimensions: '12" globe diameter, 16" total height',
      material: 'Paper map, turned wood stand',
      category: 'Decorative Arts',
    },
    {
      id: '7',
      name: 'Tiffany-Style Table Lamp',
      description: 'Stunning stained glass table lamp in the Tiffany tradition. Features dragonfly motif with jewel-toned glass. Bronze base with original patina. Height: 24 inches.',
      price: 875.00,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-LAMP-007',
      condition: 'Excellent - All glass intact',
      era: 'Art Nouveau Revival (1920s)',
      dimensions: '24" H x 16" shade diameter',
      material: 'Stained glass, bronze base',
      category: 'Lighting',
    },
    {
      id: '8',
      name: 'French Gilt Mantel Clock',
      description: 'Exquisite French ormolu mantel clock with porcelain dial. Features ornate Rococo decoration. 8-day movement with bell strike. Circa 1880. Height: 16 inches.',
      price: 1450.00,
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-CLOCK-008',
      condition: 'Excellent - Fully serviced',
      era: 'Napoleon III (1880s)',
      dimensions: '16" H x 12" W x 6" D',
      material: 'Gilt bronze (ormolu), porcelain dial',
      category: 'Timepieces',
    },
    {
      id: '9',
      name: 'Persian Hand-Knotted Rug',
      description: 'Authentic antique Persian Tabriz rug with intricate floral medallion design. Hand-knotted wool on cotton foundation. Size: 9x12 feet. Professionally cleaned.',
      price: 4500.00,
      image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-RUG-009',
      condition: 'Very Good - Normal wear',
      era: 'Early 20th Century',
      dimensions: '9\' x 12\' (108" x 144")',
      material: 'Hand-knotted wool on cotton',
      category: 'Textiles & Rugs',
    },
    {
      id: '10',
      name: 'Crystal Chandelier',
      description: 'Magnificent Austrian crystal chandelier with brass frame. Eight lights with hand-cut crystal drops and pendants. Fully rewired. Diameter: 28 inches, Height: 32 inches.',
      price: 2800.00,
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-CHAND-010',
      condition: 'Excellent - Rewired to code',
      era: 'Austrian Empire (1920s)',
      dimensions: '28" diameter x 32" H',
      material: 'Hand-cut crystal, brass frame',
      category: 'Lighting',
    },
    {
      id: '11',
      name: 'Antique Brass Telescope',
      description: 'Working brass telescope on mahogany tripod stand. Single draw nautical telescope with leather grip. Excellent for collectors or decor. Height extends to 58 inches.',
      price: 625.00,
      image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-TELE-011',
      condition: 'Very Good - Fully functional',
      era: 'Victorian Nautical (1880s)',
      dimensions: '58" extended, 24" collapsed',
      material: 'Solid brass, mahogany tripod, leather',
      category: 'Scientific Instruments',
    },
    {
      id: '12',
      name: 'Chippendale Style Chair',
      description: 'Elegant mahogany dining chair in the Chippendale style. Features ball-and-claw feet and pierced splat back. Original needlepoint seat. Circa 1920.',
      price: 480.00,
      image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-CHAIR-012',
      condition: 'Very Good - Sturdy structure',
      era: 'Colonial Revival (1920s)',
      dimensions: '39" H x 22" W x 20" D',
      material: 'Mahogany, needlepoint upholstery',
      category: 'Furniture',
    },
    {
      id: '13',
      name: 'Art Nouveau Bronze Sculpture',
      description: 'Beautiful Art Nouveau bronze figure of dancing maiden. Signed by artist. Green marble base. Excellent patina. Height: 18 inches. Circa 1905.',
      price: 1950.00,
      image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-SCULP-013',
      condition: 'Excellent - Original patina',
      era: 'Art Nouveau (1905)',
      dimensions: '18" H including base',
      material: 'Cast bronze, green marble base',
      category: 'Sculpture & Statuary',
    },
    {
      id: '14',
      name: 'Vintage Steamer Trunk',
      description: 'Louis Vuitton-style steamer trunk with original hardware and interior compartments. Canvas over wood construction. Perfect for storage or as coffee table. 36"W x 20"D x 22"H.',
      price: 850.00,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-TRUNK-014',
      condition: 'Good - Some wear consistent with age',
      era: 'Early 20th Century (1920s)',
      dimensions: '36"W x 20"D x 22"H',
      material: 'Canvas over wood, brass hardware',
      category: 'Furniture',
    },
    {
      id: '15',
      name: 'Japanese Meiji Era Screen',
      description: 'Four-panel folding screen with hand-painted landscape scene on silk. Depicts mountains and pagodas in traditional style. Lacquered wood frame. Height: 72 inches.',
      price: 3400.00,
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=400&h=400',
      sku: 'ANT-SCREEN-015',
      condition: 'Very Good - Minor silk wear',
      era: 'Meiji Period (1890s)',
      dimensions: '72" H x 64" W (four 16" panels)',
      material: 'Hand-painted silk on paper, lacquered wood frame',
      category: 'Decorative Arts',
    },
  ]
}
