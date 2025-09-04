import { useState, useEffect } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Star, Heart, Share2, Plus, Minus, ShoppingBag, Gift } from 'lucide-react'
import { useCartContext } from '../contexts/CartProvider'
import { useConfigProducts } from '../hooks/useConfigProducts'
import { useConfigContext } from '../contexts/ConfigProvider'
// Using SDK types but defining ProductVariant locally to avoid import issues
interface ProductVariant {
  id: string
  name: string
  sku?: string
  weight?: number
  imageUrl?: string
  default?: boolean
  prices: Array<{
    id: string
    amount: number
    currency: string
    recurring: boolean
    interval?: string
    intervalCount?: number
    default?: boolean
    currencyOptions: Record<string, {
      amount: number
      currency: string
    }>
  }>
}
import { toast } from 'sonner'

export function ProductDetail() {
  const { productId } = useParams<{ productId: string }>()
  const { addItem } = useCartContext()
  const { products, loading, error } = useConfigProducts()
  const { config } = useConfigContext()
  
  // Find the product by ID
  const product = products.find(p => p.id === productId)
  
  // Debug logging removed

  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null)
  const [quantity, setQuantity] = useState(1)
  const [isWishlisted, setIsWishlisted] = useState(false)

  // Update selected variant when product loads
  useEffect(() => {
    if (product?.variants[0]) {
      setSelectedVariant(product.variants[0])
    }
  }, [product])

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading product...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Error loading product: {error?.message || 'Unknown error'}</p>
          <Link to="/products" className="text-primary hover:text-primary">
            ← Back to Products
          </Link>
        </div>
      </div>
    )
  }

  // Product not found
  if (!product) {
    return (
      <div className="min-h-screen bg-white pt-20 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-light text-gray-800 mb-4">Product Not Found</h1>
          <p className="text-gray-600 mb-6">The product you're looking for doesn't exist.</p>
          <Link to="/products" className="text-primary hover:text-primary">
            ← Back to Products
          </Link>
        </div>
      </div>
    )
  }

  const handleAddToCart = () => {
    if (!selectedVariant) return

    try {
      const selectedPrice = selectedVariant.prices[0] // Use first price
      const realPriceAmount = selectedPrice?.currencyOptions?.USD?.amount || 2999 // Extract from currencyOptions
      
      addItem({
        productId: product.id,
        variantId: selectedVariant.id,
        priceId: selectedPrice?.id || 'default',
        quantity,
        name: product.name,
        image: product.variants?.[0]?.imageUrl || '/images/hero-products.jpg',
        price: realPriceAmount / 100, // Convert cents to dollars using real price
        category: 'general' // Default category since SDK doesn't provide this
      })
      
      toast.success(`Added ${quantity} ${product.name} to cart`, {
        description: `${selectedVariant.name} - $${(realPriceAmount / 100).toFixed(2)}`
      })
    } catch (error) {
      toast.error('Failed to add item to cart')
    }
  }

  return (
    <div className="min-h-screen bg-white pt-20">
      {/* Back Button */}
      <div className="container mx-auto px-6 py-4">
        <Link
          to="/products"
          className="flex items-center space-x-2 text-gray-600 hover:text-primary transition-colors duration-200"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-sm">Back to Products</span>
        </Link>
      </div>

      <div className="container mx-auto px-6 pb-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16">
          {/* Product Images */}
          <div className="space-y-4">
            {/* Main Image */}
            <div className="aspect-square bg-primary-50 rounded-3xl overflow-hidden shadow-primary-lg">
              <img
                src={product.variants?.[0]?.imageUrl || '/images/hero-products.jpg'}
                alt={product.name}
                className="w-full h-full object-cover hover:scale-110 transition-transform duration-700"
              />
            </div>

            {/* Thumbnail Images - Show variant image */}
            {product.variants?.[0]?.imageUrl && (
              <div className="flex space-x-4">
                <div className="w-20 h-20 bg-primary-50 rounded-xl overflow-hidden ring-2 ring-primary scale-105">
                  <img
                    src={product.variants[0].imageUrl}
                    alt={`${product.name} view`}
                    className="w-full h-full object-cover"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Product Details */}
          <div className="space-y-8">
            {/* Header */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-gray-300"
                    />
                  ))}
                  <span className="text-sm text-gray-600 ml-2">
                    No reviews yet
                  </span>
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setIsWishlisted(!isWishlisted)}
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-colors duration-200 ${
                      isWishlisted
                        ? 'bg-red-100 text-red-500'
                        : 'bg-gray-100 text-gray-500 hover:bg-red-100 hover:text-red-500'
                    }`}
                  >
                    <Heart className={`w-5 h-5 ${isWishlisted ? 'fill-current' : ''}`} />
                  </button>
                  <button className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 hover:bg-primary-100 hover:text-primary flex items-center justify-center transition-colors duration-200">
                    <Share2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <h1 className="text-3xl md:text-4xl font-light text-gray-800">{product.name}</h1>

              <div className="flex items-center space-x-4">
                <span className="text-3xl font-light text-primary">
                  ${selectedVariant?.prices[0]?.currencyOptions?.USD?.amount ? (selectedVariant.prices[0].currencyOptions.USD.amount / 100).toFixed(2) : '29.99'}
                </span>
              </div>
            </div>

            {/* BOGO Offer Banner - Only show if enabled in config */}
            {(config?.content?.enableBogo !== false) && (
              <div className="bogo-banner p-6 rounded-2xl text-white relative overflow-hidden">
                <div className="absolute top-2 right-2">
                  <Gift className="w-8 h-8 text-white/30" />
                </div>
                <div className="relative z-10">
                  <h3 className="text-lg font-medium mb-2">Special Offer: Buy 2, Get 1 FREE!</h3>
                  <p className="text-sm text-white/90">
                    Mix and match any products from the same category. Discount automatically applied at checkout.
                  </p>
                </div>
              </div>
            )}

            {/* Variant Selection */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-800">Size</h3>
              <div className="grid grid-cols-3 gap-3">
                {product.variants.map((variant) => (
                  <button
                    key={variant.id}
                    onClick={() => setSelectedVariant(variant)}
                    className={`p-4 rounded-xl border-2 transition-all duration-200 text-center ${
                      selectedVariant?.id === variant.id
                        ? 'border-primary bg-primary-50 text-primary'
                        : 'border-gray-200 hover:border-primary-300 hover:bg-primary-50'
                    }`}
                  >
                    <div className="font-medium">{variant.name}</div>
                    <div className="text-sm text-gray-600 mt-1">
                      ${variant.prices[0]?.currencyOptions?.USD?.amount ? (variant.prices[0].currencyOptions.USD.amount / 100).toFixed(2) : '29.99'}
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quantity and Add to Cart */}
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <span className="text-lg font-medium text-gray-800">Quantity</span>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-10 h-10 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors duration-200"
                  >
                    <Minus className="w-5 h-5 text-primary" />
                  </button>
                  <span className="w-12 text-center text-lg font-medium text-gray-800">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="w-10 h-10 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors duration-200"
                  >
                    <Plus className="w-5 h-5 text-primary" />
                  </button>
                </div>
              </div>

              <button onClick={handleAddToCart} className="w-full bg-primary hover:bg-primary-600 text-white px-6 py-4 rounded-full transition-colors duration-200 font-medium text-lg flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 mr-2" />
                Add to Cart - ${((selectedVariant?.prices[0]?.currencyOptions?.USD?.amount || 2999) / 100 * quantity).toFixed(2)}
              </button>
            </div>

            {/* Product Description */}
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Description</h3>
                <p className="text-gray-600 leading-relaxed">{product.description}</p>
              </div>

              {/* Show benefits if available, or default benefits based on product type */}
              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Key Benefits</h3>
                <ul className="space-y-2">
                  {[
                    'Premium quality ingredients',
                    'Suitable for all skin types',  
                    'Dermatologist tested',
                    'Cruelty-free formula'
                  ].map((benefit, index) => (
                    <li key={index} className="flex items-start space-x-3">
                      <div className="w-2 h-2 bg-primary-500 rounded-full mt-2 flex-shrink-0"></div>
                      <span className="text-gray-600">{benefit}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium text-gray-800 mb-3">Key Ingredients</h3>
                <p className="text-gray-600 leading-relaxed">
                  Premium natural ingredients carefully selected for optimal skin health. 
                  Full ingredient list available on product packaging.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}