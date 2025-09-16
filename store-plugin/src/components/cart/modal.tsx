

import { ArrowRight, PlusCircleIcon } from 'lucide-react';
import { useEffect, useState } from 'react';
import { useCart } from '@/hooks/use-cart';
import { motion, AnimatePresence } from 'motion/react';
import { Button } from '../ui/button';
import { Loader } from '../ui/loader';
import { CartItemCard } from './cart-item';
import { useBodyScrollLock } from '@/lib/hooks/use-body-scroll-lock';
import { Link } from 'react-router';
import { cn } from '@/lib/utils';
import { useCheckout, useCurrency } from '@tagadapay/plugin-sdk/react';
import { useTagataConfig } from '@/hooks/use-tagata-config';

const CartContainer = ({ children, className }: { children: React.ReactNode; className?: string }) => {
  return <div className={cn('px-3 md:px-4', className)}>{children}</div>;
};

const CartItems = ({ closeCart }: { closeCart: () => void }) => {
  const { format } = useCurrency();
  const { cart, getCartLines, subtotal } = useCart();

  const cartLines = getCartLines();

  if (!cart) return <></>;

  return (
    <div className="flex flex-col justify-between h-full overflow-hidden">
      <CartContainer className="flex justify-between px-2 text-sm text-muted-foreground">
        <span>Products</span>
        <span>{cartLines.length} items</span>
      </CartContainer>
      <div className="relative flex-1 min-h-0 py-4 overflow-x-hidden">
        <CartContainer className="overflow-y-auto flex flex-col gap-y-3 h-full scrollbar-hide">
          <AnimatePresence>
            {cartLines.map((item, i) => (
              <motion.div
                key={item.variantId}
                layout
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3, delay: i * 0.1, ease: 'easeOut' }}
              >
                <CartItemCard item={item} onCloseCart={closeCart} />
              </motion.div>
            ))}
          </AnimatePresence>
        </CartContainer>
      </div>
      <CartContainer>
        <div className="py-4 text-sm text-foreground/50 shrink-0">
          <div className="flex justify-between items-center pb-1 mb-3 border-b border-muted-foreground/20">
            <p>Taxes</p>
            <p className="text-right">Calculated at checkout</p>
          </div>
          <div className="flex justify-between items-center pt-1 pb-1 mb-3 border-b border-muted-foreground/20">
            <p>Shipping</p>
            <p className="text-right">Calculated at checkout</p>
          </div>
          <div className="flex justify-between items-center pt-1 pb-1 mb-1.5 text-lg font-semibold">
            <p>Total</p>
            <p className="text-base text-right text-foreground">
              {format(subtotal / 100 || 0)}
            </p>
          </div>
        </div>
        <CheckoutButton />
      </CartContainer>
    </div>
  );
};

export default function CartModal() {
  const [isOpen, setIsOpen] = useState(false);
  const { cart, getCartLines } = useCart();
  const { content } = useTagataConfig();

  const cartLines = getCartLines();

  useBodyScrollLock(isOpen);

  useEffect(() => {
    const handleEscapeKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen]);

  const openCart = () => setIsOpen(true);
  const closeCart = () => setIsOpen(false);
  
  const cartText = content.getText('cart');
  const closeText = content.getText('close');

  useEffect(() => {
    const handler: (this: Window, ev: MessageEvent) => void = (event) => {
      if (event.data.type === 'open-cart-drawer') {
        setIsOpen(true);
      }
    };

    window.addEventListener('message', handler);

    return () => {
      window.removeEventListener('message', handler);
    };
  }, []);

  const renderCartContent = () => {
    if (!cart || cartLines.length === 0) {
      return (
        <CartContainer className="flex w-full">
          <Link
            to="/shop"
            className="p-2 w-full rounded-lg border border-dashed bg-background border-border"
            onClick={closeCart}
          >
            <div className="flex flex-row gap-6">
              <div className="flex overflow-hidden relative justify-center items-center rounded-sm border border-dashed size-20 shrink-0 border-border">
                <PlusCircleIcon className="size-6 text-muted-foreground" />
              </div>
              <div className="flex flex-col flex-1 gap-2 justify-center 2xl:gap-3">
                <span className="text-lg font-semibold 2xl:text-xl">Cart is empty</span>
                <p className="text-sm text-muted-foreground hover:underline">Start shopping to get started</p>
              </div>
            </div>
          </Link>
        </CartContainer>
      );
    }

    return <CartItems closeCart={closeCart} />;
  };

  return (
    <>
      <Button aria-label="Open cart" onClick={openCart} className="uppercase" size={'sm'}>
        <span className="max-md:hidden">{cartText}</span> ({cartLines.length || 0})
      </Button>
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed inset-0 z-50 bg-foreground/30"
              onClick={closeCart}
              aria-hidden="true"
            />

            {/* Panel */}
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ duration: 0.3, ease: 'easeInOut' }}
              className="fixed top-0 bottom-0 right-0 flex w-full md:w-[500px] p-modal-sides z-50"
            >
              <div className="flex flex-col py-3 w-full rounded bg-muted md:py-4">
                <CartContainer className="flex justify-between items-baseline mb-10">
                  <p className="text-2xl font-semibold">{cartText.charAt(0).toUpperCase() + cartText.slice(1)}</p>
                  <Button size="sm" variant="ghost" aria-label="Close cart" onClick={closeCart}>
                    {closeText}
                  </Button>
                </CartContainer>

                {renderCartContent()}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}

function CheckoutButton() {
  const { getCartLines, cartToken } = useCart();
  const checkout = useCheckout();
  const cartLines = getCartLines();
  const [isPending, setIsPending] = useState(false);
  
  return (
    <Button
      type="submit"
      disabled={isPending || checkout.isLoading}
      size="lg"
      className="flex relative gap-3 justify-between items-center w-full"
      onClick={async () => {
        try {
          if (isPending) {
            return;
          }
  
          setIsPending(true);
          const checkoutResult = await checkout.init({ lineItems: cartLines, cartToken });
          window.location.href = checkoutResult.checkoutUrl;

        } catch (error) {
          console.error(error);
        }
      }}
    >
      <AnimatePresence initial={false} mode="wait">
        <motion.div
          key={isPending ? 'loading' : 'content'}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          className="flex justify-center items-center w-full"
        >
          {isPending ? (
            <Loader size="default" />
          ) : (
            <div className="flex justify-between items-center w-full">
              <span>Proceed to Checkout</span>
              <ArrowRight className="size-6" />
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </Button>
  );
}
