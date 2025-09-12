"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  formatMoney,
  useApplePay,
  useCheckout,
  type ApplePayConfig,
  type ApplePayLineItem,
} from "@tagadapay/plugin-sdk/react";
import { toast } from "react-hot-toast";

interface ApplePayButtonProps {
  className?: string;
  onSuccess?: (payment: any) => void;
  onError?: (error: string) => void;
  onCancel?: () => void;
  config?: ApplePayConfig;
}

export function ApplePayButton({
  className,
  onSuccess,
  onError,
  onCancel,
  config = {},
}: ApplePayButtonProps) {
  const { checkout } = useCheckout();
  const { handleApplePayClick, processingPayment, isApplePayAvailable } =
    useApplePay({
      onSuccess: (payment) => {
        console.log("✅ Apple Pay payment successful:", payment);
        toast.success("Payment successful!");
        onSuccess?.(payment);
      },
      onError: (error) => {
        console.error("❌ Apple Pay payment failed:", error);
        toast.error(`Payment failed: ${error}`);
        onError?.(error);
      },
      onCancel: () => {
        console.log("🚫 Apple Pay payment cancelled");
        onCancel?.();
      },
    });

  console.log("isApplePayAvailable", isApplePayAvailable);

  // Don't render if Apple Pay is not available
  if (!isApplePayAvailable) {
    return null;
  }

  // Prepare line items for Apple Pay
  const lineItems: ApplePayLineItem[] = [
    {
      label: "Subtotal",
      amount: formatMoney(checkout?.summary?.totalAmount || 0).replace(
        /[^\d.]/g,
        ""
      ),
      type: "final",
    },
    {
      label: "Shipping",
      amount: "0.00", // Free shipping
      type: "final",
    },
    {
      label: "Tax",
      amount: "0.00", // Tax included in total amount
      type: "final",
    },
  ];

  const total: ApplePayLineItem = {
    label: "Lavish Ivy Store",
    amount: formatMoney(checkout?.summary?.totalAdjustedAmount || 0).replace(
      /[^\d.]/g,
      ""
    ),
    type: "final",
  };

  const handleClick = () => {
    if (!checkout?.checkoutSession?.id) {
      toast.error("Checkout session not ready. Please try again.");
      return;
    }

    handleApplePayClick(checkout.checkoutSession.id, lineItems, total, {
      countryCode: config.countryCode || "US",
      supportedNetworks: config.supportedNetworks || [
        "visa",
        "masterCard",
        "amex",
        "discover",
      ],
      merchantCapabilities: config.merchantCapabilities || ["supports3DS"],
    });
  };

  return (
    <Button
      onClick={handleClick}
      disabled={processingPayment || !checkout?.checkoutSession?.id}
      className={cn(
        "h-12 w-full bg-black text-white hover:bg-gray-800 disabled:cursor-not-allowed disabled:opacity-50",
        "flex items-center justify-center gap-2 font-medium",
        className
      )}
    >
      {processingPayment ? (
        <>
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
          Processing...
        </>
      ) : (
        <>
          <svg
            className="text-white fill-white"
            xmlns="http://www.w3.org/2000/svg"
            width="24px"
            height="24px"
            viewBox="0 0 24 24"
          >
            <path d="M18.71 19.5C17.88 20.74 17 21.95 15.66 21.97C14.32 22 13.89 21.18 12.37 21.18C10.84 21.18 10.37 21.95 9.09997 22C7.78997 22.05 6.79997 20.68 5.95997 19.47C4.24997 17 2.93997 12.45 4.69997 9.39C5.56997 7.87 7.12997 6.91 8.81997 6.88C10.1 6.86 11.32 7.75 12.11 7.75C12.89 7.75 14.37 6.68 15.92 6.84C16.57 6.87 18.39 7.1 19.56 8.82C19.47 8.88 17.39 10.1 17.41 12.63C17.44 15.65 20.06 16.66 20.09 16.67C20.06 16.74 19.67 18.11 18.71 19.5ZM13 3.5C13.73 2.67 14.94 2.04 15.94 2C16.07 3.17 15.6 4.35 14.9 5.19C14.21 6.04 13.07 6.7 11.95 6.61C11.8 5.46 12.36 4.26 13 3.5Z" />
          </svg>
          Pay with Apple Pay
        </>
      )}
    </Button>
  );
}
