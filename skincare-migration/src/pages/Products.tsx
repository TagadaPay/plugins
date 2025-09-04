import { Link } from 'react-router-dom'
import { ArrowLeft, Star, ShoppingBag } from 'lucide-react'
import { useCartContext } from '../contexts/CartProvider'
import { useConfigProducts } from '../hooks/useConfigProducts'
import { useConfigContext } from '../contexts/ConfigProvider'
import { toast } from 'sonner'

// Interface for simplified product display
interface DisplayProduct {
  id: string
  name: string
  category: string
  price: number
  originalPrice?: number
  rating?: number
  reviewCount?: number
  images: string[]
  description: string
  variants?: any[] // Add variants for cart functionality
}

export function Products() {
  const { addItem } = useCartContext()
  const { products, loading, error } = useConfigProducts()
  const { config } = useConfigContext()


  const handleAddToCart = (product: DisplayProduct, e: React.MouseEvent) => {
    e.preventDefault() // Prevent navigation to product page
    
    try {
      // Get the first variant and price for simplicity
      const firstVariant = product.variants?.[0]
      const firstPrice = firstVariant?.prices?.[0]
      const realPriceAmount = firstPrice?.currencyOptions?.USD?.amount
      
      addItem({
        productId: product.id,
        variantId: firstVariant?.id || 'default',
        priceId: firstPrice?.id || 'default',
        quantity: 1,
        name: product.name,
        image: product.images[0] || '/images/hero-products.jpg', // This now uses the variant image
        price: realPriceAmount ? realPriceAmount / 100 : product.price, // Extract from currencyOptions
        category: product.category
      })
      
      toast.success(`Added ${product.name} to cart`, {
        description: `$${(realPriceAmount ? realPriceAmount / 100 : product.price).toFixed(2)}`
      })
    } catch (error) {
      toast.error('Failed to add item to cart')
    }
  }

  // Convert SDK Product type to DisplayProduct - extract real prices from currencyOptions
  const displayProducts: DisplayProduct[] = products.map(product => {
    // Handle price extraction from nested currencyOptions structure
    const firstPrice = product.variants?.[0]?.prices?.[0]
    const realPriceAmount = firstPrice?.currencyOptions?.USD?.amount
    
    
    return {
      id: product.id,
      name: product.name,
      category: 'general',
      // Extract real price from currencyOptions.USD.amount
      price: realPriceAmount ? realPriceAmount / 100 : 29.99,
      originalPrice: undefined,
      rating: undefined,
      reviewCount: undefined,
      // Extract image from first variant since that's where Tagada stores them
      images: product.variants?.[0]?.imageUrl ? [product.variants[0].imageUrl] : ['/images/hero-products.jpg'],
      description: product.description || 'Premium skincare product',
      variants: product.variants
    }
  })

  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading products...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading products: {error?.toString() || 'Unknown error'}</p>
          <Link to="/" className="text-primary hover:text-primary">
            ← Back to Home
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Header */}
      <div className="container mx-auto px-6 py-4">
        <Link
          to="/"
          className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors duration-200 mb-6"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to Home</span>
        </Link>

        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-light text-gray-800 mb-4">Our Products</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Discover our complete range of skincare essentials, crafted with premium ingredients.
          </p>
          
          {/* Data Source Indicator */}
          <div className="mt-6 flex justify-center">
            {products.length > 0 && products[0].name.includes('[MOCK]') ? (
              <div className="bg-orange-100 border border-orange-300 text-orange-800 px-4 py-2 rounded-full text-sm font-medium">
                🔄 Currently showing MOCK data (SDK issue)
              </div>
            ) : products.length > 0 ? (
              <div className="bg-green-100 border border-green-300 text-green-800 px-4 py-2 rounded-full text-sm font-medium">
                ✅ Showing REAL products from Tagada SDK
              </div>
            ) : (
              <div className="bg-gray-100 border border-gray-300 text-gray-600 px-4 py-2 rounded-full text-sm font-medium">
                🔍 Loading products...
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Products Grid */}
      <div className="container mx-auto px-6 pb-20">
        {displayProducts.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No products available at the moment.</p>
            <Link to="/" className="text-primary hover:text-primary">
              ← Back to Home
            </Link>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayProducts.map((product) => (
              <div key={product.id} className="group">
                <div className="bg-white rounded-3xl shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 overflow-hidden">
                  {/* Product Image */}
                  <div className="aspect-square bg-primary-50 overflow-hidden">
                    <img
                      src={product.images[0] || '/images/placeholder.jpg'}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                    />
                  </div>

                  {/* Product Info */}
                  <div className="p-6 space-y-4">
                    {/* Rating */}
                    {product.rating && (
                      <div className="flex items-center space-x-2">
                        <div className="flex items-center space-x-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`w-4 h-4 ${
                                i < Math.floor(product.rating!)
                                  ? 'fill-primary text-primary'
                                  : 'text-gray-300'
                              }`}
                            />
                          ))}
                        </div>
                        <span className="text-sm text-gray-600">
                          {product.rating} {product.reviewCount && `(${product.reviewCount} reviews)`}
                        </span>
                      </div>
                    )}

                    {/* Name & Description */}
                    <div>
                      <h3 className="text-xl font-light text-gray-800 mb-2">{product.name}</h3>
                      <p className="text-gray-600 text-sm leading-relaxed">{product.description}</p>
                    </div>

                    {/* Price */}
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl font-light text-primary">${product.price.toFixed(2)}</span>
                      {product.originalPrice && product.originalPrice > product.price && (
                        <span className="text-lg text-gray-400 line-through">
                          ${product.originalPrice.toFixed(2)}
                        </span>
                      )}
                    </div>

                    {/* Actions */}
                    <div className="flex flex-col sm:flex-row gap-3">
                      <Link
                        to={`/products/${product.id}`}
                        className="flex-1 bg-primary hover:bg-primary-600 text-white px-6 py-3 rounded-full text-center transition-colors duration-200 font-medium text-sm"
                      >
                        View Details
                      </Link>
                      <button 
                        onClick={(e) => handleAddToCart(product, e)}
                        className="flex-1 border-2 border-primary-200 text-primary hover:bg-primary-50 px-6 py-3 rounded-full transition-colors duration-200 font-medium text-sm flex items-center justify-center"
                      >
                        <ShoppingBag className="w-4 h-4 mr-2" />
                        Quick Add
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* BOGO Banner - Only show if enabled in config */}
      {(config?.content?.enableBogo !== false) && (
        <section className="py-16 bogo-banner">
          <div className="container mx-auto px-6 text-center">
            <div className="max-w-2xl mx-auto space-y-6">
              <h2 className="text-3xl md:text-4xl font-light text-white mb-4">Special Offer</h2>
              <p className="text-white/90 text-lg mb-6">
                Buy 2, Get 1 FREE! Mix and match any products from the same category. 
                Discount automatically applied at checkout.
              </p>
              <div className="bg-white/20 backdrop-blur-sm rounded-2xl p-6 text-white">
                <p className="text-sm">
                  ✨ Perfect time to try our complete skincare routine
                </p>
              </div>
            </div>
          </div>
        </section>
      )}
      
    </div>
  )
}