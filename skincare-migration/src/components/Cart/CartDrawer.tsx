import { useEffect, useState } from "react";
import { useCartContext } from "../../contexts/CartProvider";
import { useConfigContext } from "../../contexts/ConfigProvider";
import { useCheckout } from "../../hooks/useCheckout";
import { X, Plus, Minus, ShoppingBag, Trash2, Loader } from "lucide-react";

export function CartDrawer() {
  const {
    isOpen,
    items,
    itemCount,
    subtotal,
    discount,
    total,
    cartToken,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCartContext();
  const { config } = useConfigContext();

  const {
    initializeCheckout,
    // isLoading: isCheckoutLoading, // Not used in UI currently
    // error: checkoutError, // Not used in UI currently
  } = useCheckout();
  const [isProcessing, setIsProcessing] = useState(false);

  // Prevent body scroll when cart is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  // Handle checkout with new Tagada integration
  const handleCheckout = async () => {
    if (items.length === 0) {
      return;
    }

    setIsProcessing(true);
    try {
      await initializeCheckout();
    } catch (error) {
      alert(
        `Checkout failed: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
    } finally {
      setIsProcessing(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300"
        onClick={closeCart}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Escape" && closeCart()}
        aria-label="Close cart"
      />

      {/* Cart Panel */}
      <div
        className={`fixed top-0 right-0 h-full w-full md:w-96 lg:w-[28rem] bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-labelledby="cart-title"
        aria-modal="true"
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-primary-100 bg-gradient-to-r from-primary-50 to-secondary-50">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
                <ShoppingBag className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2
                  id="cart-title"
                  className="text-xl font-light text-gray-800"
                >
                  Shopping Cart
                </h2>
                <p className="text-sm text-gray-600">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
              </div>
            </div>
            <button
              onClick={closeCart}
              className="w-10 h-10 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center hover:bg-white transition-colors duration-200 shadow-sm"
              aria-label="Close cart"
            >
              <X className="w-5 h-5 text-gray-600" />
            </button>
          </div>

          {/* Cart Items */}
          <div className="flex-1 overflow-y-auto">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                <div className="w-20 h-20 bg-primary-100 rounded-full flex items-center justify-center mb-4">
                  <ShoppingBag className="w-10 h-10 text-primary" />
                </div>
                <h3 className="text-lg font-medium text-gray-800 mb-2">
                  Your cart is empty
                </h3>
                <p className="text-gray-600 mb-6">
                  Add some products to get started
                </p>
                <button onClick={closeCart} className="btn-primary">
                  Continue Shopping
                </button>
              </div>
            ) : (
              <div className="p-6 space-y-6">
                {/* Debug info - remove in production */}
                <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
                  Cart Token: {cartToken}
                </div>

                {items.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="cart-item-card group"
                  >
                    <div className="flex space-x-4">
                      {/* Product Image */}
                      <div className="relative w-20 h-20 bg-primary-50 rounded-xl overflow-hidden flex-shrink-0">
                        <img
                          src={item.image}
                          alt={item.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>

                      {/* Product Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-2">
                          <div>
                            <h3 className="font-medium text-gray-800 text-sm leading-tight">
                              {item.name}
                            </h3>
                            <p className="text-xs text-gray-500 mt-1">
                              Size: {item.variantId}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              removeItem(item.productId, item.variantId)
                            }
                            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-red-100 flex items-center justify-center transition-colors duration-200 opacity-0 group-hover:opacity-100"
                            aria-label={`Remove ${item.name} from cart`}
                          >
                            <Trash2 className="w-4 h-4 text-gray-500 hover:text-red-500" />
                          </button>
                        </div>

                        {/* Price and Quantity */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className="font-medium text-primary">
                              ${item.price.toFixed(2)}
                            </span>
                            {item.originalPrice &&
                              item.originalPrice > item.price && (
                                <span className="text-xs text-gray-400 line-through">
                                  ${item.originalPrice.toFixed(2)}
                                </span>
                              )}
                          </div>

                          {/* Quantity Controls */}
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.variantId,
                                  Math.max(0, item.quantity - 1)
                                )
                              }
                              className="w-8 h-8 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors duration-200"
                              aria-label="Decrease quantity"
                            >
                              <Minus className="w-4 h-4 text-primary" />
                            </button>
                            <span className="w-8 text-center text-sm font-medium text-gray-800">
                              {item.quantity}
                            </span>
                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.variantId,
                                  item.quantity + 1
                                )
                              }
                              className="w-8 h-8 rounded-full bg-primary-100 hover:bg-primary-200 flex items-center justify-center transition-colors duration-200"
                              aria-label="Increase quantity"
                            >
                              <Plus className="w-4 h-4 text-primary" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {/* BOGO Info - Only show if enabled in config */}
                {(config?.content?.enableBogo !== false) && discount > 0 && (
                  <div className="bogo-banner p-4 rounded-2xl text-white">
                    <h3 className="font-medium mb-1">
                      BOGO Discount Applied! 🎉
                    </h3>
                    <p className="text-sm text-white/90">
                      You're saving ${discount.toFixed(2)} with our Buy 2 Get 1
                      FREE offer!
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Footer with Totals and Checkout */}
          {items.length > 0 && (
            <div className="border-t border-primary-100 bg-gradient-to-r from-primary-50 to-secondary-50 p-6 space-y-4">
              {/* Totals */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="text-gray-800">${subtotal.toFixed(2)}</span>
                </div>
                {(config?.content?.enableBogo !== false) && discount > 0 && (
                  <div className="flex justify-between text-sm">
                    <span className="text-primary">BOGO Discount</span>
                    <span className="text-primary">
                      -${discount.toFixed(2)}
                    </span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-medium pt-2 border-t border-primary-200">
                  <span className="text-gray-800">Total</span>
                  <span className="text-primary">${total.toFixed(2)}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <button
                  onClick={handleCheckout}
                  className="w-full btn-primary text-base py-4 flex items-center justify-center space-x-2"
                  disabled={items.length === 0 || isProcessing}
                >
                  {isProcessing ? (
                    <>
                      <Loader className="w-5 h-5 animate-spin" />
                      <span>Processing...</span>
                    </>
                  ) : (
                    <span>Proceed to Checkout</span>
                  )}
                </button>

                <div className="flex space-x-3">
                  <button
                    onClick={closeCart}
                    className="flex-1 btn-secondary text-sm py-3"
                  >
                    Continue Shopping
                  </button>
                  <button
                    onClick={clearCart}
                    className="px-4 py-3 text-sm text-red-600 hover:bg-red-50 rounded-full transition-colors duration-200"
                  >
                    Clear Cart
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
