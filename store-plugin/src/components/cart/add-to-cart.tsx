

import { PlusCircleIcon } from 'lucide-react';
import { useTransition } from 'react';
import { Button, type ButtonProps } from '../ui/button';
import type { ReactNode } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Loader } from '../ui/loader';
import { useCart } from '@/hooks/use-cart';
import type { ProductVariant } from '@/storage/cart/types';

interface AddToCartProps extends ButtonProps {
  product: ProductVariant;
  iconOnly?: boolean;
  icon?: ReactNode;
}

interface AddToCartButtonProps extends ButtonProps {
  product?: ProductVariant | null;
  iconOnly?: boolean;
  icon?: ReactNode;
  className?: string;
}

export function AddToCartButton({
  product,
  className,
  iconOnly = false,
  icon = <PlusCircleIcon />,
  ...buttonProps
}: AddToCartButtonProps) {
  const { addProduct } = useCart();
  const [isLoading, startTransition] = useTransition();

  const getButtonText = () => {
    return 'Add To Cart';
  };

  const isDisabled = isLoading;

  const getLoaderSize = () => {
    const buttonSize = buttonProps.size;
    if (buttonSize === 'sm' || buttonSize === 'icon-sm' || buttonSize === 'icon') return 'sm';
    if (buttonSize === 'icon-lg') return 'default';
    if (buttonSize === 'lg') return 'lg';
    return 'default';
  };

  return (
    <form
      onSubmit={e => {
        e.preventDefault();

        if (product) {
          startTransition(async () => {
            addProduct(product.productId, product.id, product.prices[0]?.id, 1);
            window.postMessage({ type: 'open-cart-drawer' }, '*');
          });
        }
      }}
      className={className}
    >
      <Button
        type="submit"
        aria-label={!product ? 'Select one' : 'Add to cart'}
        disabled={isDisabled}
        className={iconOnly ? undefined : 'flex relative justify-between items-center w-full'}
        {...buttonProps}
      >
        <AnimatePresence initial={false} mode="wait">
          {iconOnly ? (
            <motion.div
              key={isLoading ? 'loading' : 'icon'}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.15 }}
              className="flex justify-center items-center"
            >
              {isLoading ? <Loader size={getLoaderSize()} /> : <span className="inline-block">{icon}</span>}
            </motion.div>
          ) : (
            <motion.div
              key={isLoading ? 'loading' : getButtonText()}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.15 }}
              className="flex justify-center items-center w-full"
            >
              {isLoading ? (
                <Loader size={getLoaderSize()} />
              ) : (
                <div className="flex justify-between items-center w-full">
                  <span>{getButtonText()}</span>
                  <PlusCircleIcon />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </Button>
    </form>
  );
}

export function AddToCart({
  product,
  className,
  iconOnly = false,
  icon = <PlusCircleIcon />,
  ...buttonProps
}: AddToCartProps) {

  return (
    <AddToCartButton
      product={product}
      className={className}
      iconOnly={iconOnly}
      icon={icon}
      {...buttonProps}
    />
  );
}
