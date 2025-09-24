"use client";

import { CustomerIdBadge } from "@/components/AdvancedBadges";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  formatMoney,
  useCurrency,
  useCustomer,
  useCustomerOrders,
} from "@tagadapay/plugin-sdk/react";
import { format } from "date-fns";
import {
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Clock,
  Package,
  ShoppingBag,
} from "lucide-react";
import { useLocation } from "wouter";

type OrderStatus = "open" | "paid" | "abandoned" | "failed" | "cancelled";
type PaymentStatus =
  | "succeeded"
  | "pending"
  | "failed"
  | "error"
  | "refunded"
  | "declined"
  | "expired"
  | "rejected";

const StatusBadge = ({
  status,
  type = "payment",
  size = "default",
}: {
  status: OrderStatus | PaymentStatus | string;
  type?: "order" | "payment";
  size?: "default" | "small";
}) => {
  const sizeClasses = {
    default: "px-2.5 py-0.5 text-sm gap-1.5",
    small: "px-2 py-0.5 text-xs gap-1",
  };

  const getPaymentText = (status: string) => {
    switch (status) {
      case "succeeded":
        return "Payment completed";
      case "pending":
        return "Payment pending";
      case "failed":
        return "Payment failed";
      case "error":
        return "Payment error";
      case "refunded":
        return "Payment refunded";
      case "declined":
        return "Payment declined";
      case "expired":
        return "Payment expired";
      case "rejected":
        return "Payment rejected";
      default:
        return `Payment ${status}`;
    }
  };

  const statusConfig = {
    // Payment statuses
    succeeded: {
      icon: CheckCircle,
      text: "Paid",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconClass: "text-emerald-500",
    },
    pending: {
      icon: Clock,
      text: "Pending",
      className: "bg-amber-50 text-amber-700 border-amber-200",
      iconClass: "text-amber-500",
    },
    failed: {
      icon: AlertCircle,
      text: "Failed",
      className: "bg-red-50 text-red-700 border-red-200",
      iconClass: "text-red-500",
    },
    // Order statuses
    open: {
      icon: Clock,
      text: "Open",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      iconClass: "text-blue-500",
    },
    paid: {
      icon: CheckCircle,
      text: "Paid",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconClass: "text-emerald-500",
    },
    abandoned: {
      icon: AlertCircle,
      text: "Abandoned",
      className: "bg-gray-50 text-gray-700 border-gray-200",
      iconClass: "text-gray-500",
    },
    cancelled: {
      icon: AlertCircle,
      text: "Cancelled",
      className: "bg-gray-50 text-gray-700 border-gray-200",
      iconClass: "text-gray-500",
    },
    // ... rest of the payment statuses remain the same
  } as const;

  // Default config for unknown status
  const defaultConfig = {
    icon: AlertCircle,
    text: status || "Unknown",
    className: "bg-gray-50 text-gray-700 border-gray-200",
    iconClass: "text-gray-500",
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || defaultConfig;
  const Icon = config.icon;
  const text = type === "payment" ? getPaymentText(status) : config.text;

  return (
    <div
      className={`inline-flex items-center rounded-full border ${sizeClasses[size]} ${config.className}`}
    >
      <Icon size={size === "small" ? 12 : 14} className={config.iconClass} />
      <span>{text}</span>
    </div>
  );
};

const OrderCard = ({
  order,
  currency,
  onClick,
}: {
  order: any;
  currency: string;
  onClick: () => void;
}) => {
  const currentSummary = order.summaries.find(
    (s: any) => s.currency === currency
  );
  if (!currentSummary) return null;

  const itemCount = order.items.filter(
    (item: any) => item.currency === currency
  ).length;
  const firstItem = order.items.find((item: any) => item.currency === currency);
  const hasMoreItems = itemCount > 1;

  return (
    <div
      onClick={onClick}
      className="group h-full rounded-lg border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-md"
    >
      <div className="border-b border-gray-100 bg-gray-50/50 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white p-2 shadow-sm">
              <ShoppingBag className="h-5 w-5 text-gray-600" />
            </div>
            {/* <OrderIdBadge orderId={order.id} /> */}
          </div>
          <StatusBadge status={order.status} type="order" />
        </div>
      </div>

      <div className="p-3 sm:p-4">
        <div className="flex gap-3 sm:gap-4">
          {/* Thumbnail */}
          <div className="relative h-16 w-16 sm:h-20 sm:w-20 flex-shrink-0 overflow-hidden rounded-lg border border-gray-200">
            {firstItem?.orderLineItemVariant?.imageUrl ? (
              <img
                src={firstItem.orderLineItemVariant.imageUrl}
                alt={firstItem.orderLineItemProduct?.name || ""}
                className="object-contain p-2 w-full h-full"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-gray-50">
                <Package className="h-6 w-6 sm:h-8 sm:w-8 text-gray-400" />
              </div>
            )}
          </div>

          {/* Order Info */}
          <div className="flex flex-1 flex-col">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium text-gray-900">
                  {itemCount} {itemCount === 1 ? "item" : "items"}
                </p>
                <p className="mt-1 text-xs sm:text-sm text-gray-500">
                  Ordered{" "}
                  {order.createdAt
                    ? format(new Date(order.createdAt), "MMM d, yyyy")
                    : "Date not available"}
                </p>
              </div>
              <div className="text-right">
                <p className="text-base sm:text-lg font-semibold text-gray-900">
                  {formatMoney(currentSummary.totalAdjustedAmount, currency)}
                </p>
                {currentSummary.totalAmount !==
                  currentSummary.totalAdjustedAmount && (
                  <p className="text-xs sm:text-sm text-gray-500 line-through">
                    {formatMoney(currentSummary.totalAmount, currency)}
                  </p>
                )}
              </div>
            </div>

            {/* Preview of items */}
            <div className="mt-1 sm:mt-2 text-xs sm:text-sm text-gray-600 line-clamp-1">
              {firstItem?.orderLineItemProduct?.name}
              {hasMoreItems && ` + ${itemCount - 1} more`}
            </div>

            {/* Payment Status and View Details */}
            <div className="mt-2 flex items-center justify-between">
              <StatusBadge
                status={order.payments?.[0]?.status || "pending"}
                type="payment"
                size="small"
              />
              {/* <Button
                variant="ghost"
                className="hidden sm:flex opacity-0 transition-opacity group-hover:opacity-100 text-sm py-1 px-2"
              >
                View details <ChevronRight className="ml-1 h-4 w-4" />
              </Button> */}
              <ChevronRight className="h-5 w-5 text-gray-400 sm:hidden" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MyOrdersTab() {
  const { customer } = useCustomer();
  const customerId = customer?.id;
  const [, navigate] = useLocation();

  const { data: ordersData, isLoading } = useCustomerOrders({
    customerId,
    enabled: Boolean(customerId),
  });

  const currency = useCurrency();

  if (isLoading) {
    return <LoadingSpinner />;
  }

  const navigateToOrderDetails = (orderId: string) => {
    navigate(`/orders/${orderId}`);
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            My Orders
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {customerId && <CustomerIdBadge customerId={customerId} />}
            <span className="text-xs sm:text-sm text-gray-500">
              {ordersData?.orders?.length || 0} orders
            </span>
          </div>
        </div>
      </div>

      {ordersData?.orders?.length === 0 ? (
        <div className="flex min-h-[200px] sm:min-h-[300px] flex-col items-center justify-center rounded-lg bg-gray-50 p-4 sm:p-8">
          <div className="rounded-full bg-gray-100 p-3">
            <Package className="h-8 w-8 text-gray-400" />
          </div>
          <p className="mt-4 text-gray-600">
            You haven't placed any orders yet.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {ordersData?.orders?.map((order) => (
            <OrderCard
              key={order.id}
              order={order}
              currency={currency.code}
              onClick={() => navigateToOrderDetails(order.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
