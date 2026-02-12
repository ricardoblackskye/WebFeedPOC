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
    },
    {
      id: '2',
      name: 'Ming Dynasty Porcelain Vase',
      description: 'Authentic hand-painted Chinese porcelain vase, circa 1920. Features traditional blue and white floral patterns. Height: 14 inches. Excellent condition.',
      price: 1850.00,
      image: 'https://images.unsplash.com/photo-1610701596007-11502861dcfa?auto=format&fit=crop&w=400&h=400',
    },
    {
      id: '3',
      name: 'Art Deco Sunburst Mirror',
      description: 'Gorgeous gilt-wood sunburst mirror in classic Art Deco style. Original brass frame with antiqued patina. Diameter: 32 inches. Perfect statement piece.',
      price: 680.00,
      image: 'https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=400&h=400',
    },
    {
      id: '4',
      name: 'Edwardian Oak Writing Desk',
      description: 'Magnificent solid oak writing desk with green leather inlay, circa 1910. Nine drawers with original brass hardware. Perfect for home office. 48"W x 28"D x 30"H.',
      price: 2400.00,
      image: 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=400&h=400',
    },
    {
      id: '5',
      name: 'Sterling Silver Tea Set',
      description: 'Complete Victorian-era sterling silver tea service. Includes teapot, coffee pot, sugar bowl, and creamer. Hallmarked Birmingham 1895. Total weight: 84 oz.',
      price: 3200.00,
      image: 'https://images.unsplash.com/photo-1542060748-10c28b62716f?auto=format&fit=crop&w=400&h=400',
    },
    {
      id: '6',
      name: 'Vintage Illuminated Globe',
      description: 'Beautifully preserved 1960s Replogle globe on turned wooden stand. Internal illumination showcases hand-drawn cartography. Diameter: 12 inches.',
      price: 295.00,
      image: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=400&h=400',
    },
    {
      id: '7',
      name: 'Tiffany-Style Table Lamp',
      description: 'Stunning stained glass table lamp in the Tiffany tradition. Features dragonfly motif with jewel-toned glass. Bronze base with original patina. Height: 24 inches.',
      price: 875.00,
      image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=400&h=400',
    },
    {
      id: '8',
      name: 'French Gilt Mantel Clock',
      description: 'Exquisite French ormolu mantel clock with porcelain dial. Features ornate Rococo decoration. 8-day movement with bell strike. Circa 1880. Height: 16 inches.',
      price: 1450.00,
      image: 'https://images.unsplash.com/photo-1533090161767-e6ffed986c88?auto=format&fit=crop&w=400&h=400',
    },
    {
      id: '9',
      name: 'Persian Hand-Knotted Rug',
      description: 'Authentic antique Persian Tabriz rug with intricate floral medallion design. Hand-knotted wool on cotton foundation. Size: 9x12 feet. Professionally cleaned.',
      price: 4500.00,
      image: 'https://images.unsplash.com/photo-1600166898405-da9535204843?auto=format&fit=crop&w=400&h=400',
    },
    {
      id: '10',
      name: 'Crystal Chandelier',
      description: 'Magnificent Austrian crystal chandelier with brass frame. Eight lights with hand-cut crystal drops and pendants. Fully rewired. Diameter: 28 inches, Height: 32 inches.',
      price: 2800.00,
      image: 'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=400&h=400',
    },
    {
      id: '11',
      name: 'Antique Brass Telescope',
      description: 'Working brass telescope on mahogany tripod stand. Single draw nautical telescope with leather grip. Excellent for collectors or decor. Height extends to 58 inches.',
      price: 625.00,
      image: 'https://images.unsplash.com/photo-1581092918056-0c4c3acd3789?auto=format&fit=crop&w=400&h=400',
    },
    {
      id: '12',
      name: 'Chippendale Style Chair',
      description: 'Elegant mahogany dining chair in the Chippendale style. Features ball-and-claw feet and pierced splat back. Original needlepoint seat. Circa 1920.',
      price: 480.00,
      image: 'https://images.unsplash.com/photo-1503602642458-232111445657?auto=format&fit=crop&w=400&h=400',
    },
    {
      id: '13',
      name: 'Art Nouveau Bronze Sculpture',
      description: 'Beautiful Art Nouveau bronze figure of dancing maiden. Signed by artist. Green marble base. Excellent patina. Height: 18 inches. Circa 1905.',
      price: 1950.00,
      image: 'https://images.unsplash.com/photo-1580274455191-1c62238fa333?auto=format&fit=crop&w=400&h=400',
    },
    {
      id: '14',
      name: 'Vintage Steamer Trunk',
      description: 'Louis Vuitton-style steamer trunk with original hardware and interior compartments. Canvas over wood construction. Perfect for storage or as coffee table. 36"W x 20"D x 22"H.',
      price: 850.00,
      image: 'https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=400&h=400',
    },
    {
      id: '15',
      name: 'Japanese Meiji Era Screen',
      description: 'Four-panel folding screen with hand-painted landscape scene on silk. Depicts mountains and pagodas in traditional style. Lacquered wood frame. Height: 72 inches.',
      price: 3400.00,
      image: 'https://images.unsplash.com/photo-1582735689369-4fe89db7114c?auto=format&fit=crop&w=400&h=400',
    },
  ]
}
