"use client";

import { format } from "date-fns";
import {
  AlertCircle,
  Calendar,
  CheckCircle,
  Clock,
  CreditCard,
} from "lucide-react";
import { useState } from "react";

import { CustomerIdBadge } from "@/components/AdvancedBadges";
import { Button } from "@/components/Button";
import { useDialog } from "@/hooks/use-dialog";
import { PluginConfig } from "@/types/plugin-config";
import {
  useCustomer,
  useCustomerSubscriptions,
  usePluginConfig,
} from "@tagadapay/plugin-sdk/react";
import React from "react";

// Define subscription type
interface Subscription {
  id: string;
  status: string;
  createdAt: string;
  currency: string;
  cancelAtPeriodEnd: boolean;
  currentPeriodEnd: string | null;
  currentPeriodStart: string | null;
  quantity: number;
  trialEnd: string | null;
  customerId: string;
  customerEmail: string;
  customerName: string;
  priceCurrencyOptions: Record<
    string,
    {
      rate: number;
      amount: number;
      lock: boolean;
      date: string;
    }
  >;
  priceInterval: string;
  priceIntervalCount: number;
  priceRecurring: boolean;
  productId: string;
  priceId: string;
  productTitle: string;
}

const StatusBadge = ({
  status,
  size = "default",
}: {
  status: string;
  size?: "default" | "small";
}) => {
  const sizeClasses = {
    default: "px-2.5 py-0.5 text-sm gap-1.5",
    small: "px-2 py-0.5 text-xs gap-1",
  };

  const statusConfig = {
    active: {
      icon: CheckCircle,
      text: "active",
      className: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconClass: "text-emerald-500",
    },
    trialing: {
      icon: Clock,
      text: "trial",
      className: "bg-blue-50 text-blue-700 border-blue-200",
      iconClass: "text-blue-500",
    },
    canceling: {
      icon: AlertCircle,
      text: "canceling",
      className: "bg-yellow-50 text-yellow-700 border-yellow-200",
      iconClass: "text-yellow-500",
    },
  } as const;

  const defaultConfig = {
    icon: AlertCircle,
    text: status.charAt(0).toUpperCase() + status.slice(1),
    className: "bg-gray-50 text-gray-700 border-gray-200",
    iconClass: "text-gray-500",
  };

  const config =
    statusConfig[status as keyof typeof statusConfig] || defaultConfig;
  const Icon = config.icon;

  return (
    <div
      className={`inline-flex items-center rounded-full border ${sizeClasses[size]} ${config.className}`}
    >
      <Icon size={size === "small" ? 12 : 14} className={config.iconClass} />
      <span>{config.text}</span>
    </div>
  );
};

const SubscriptionCard = ({
  subscription,
  refetch,
  onCancel,
  onResume,
}: {
  subscription: Subscription;
  refetch: () => void;
  onCancel: (
    subscriptionId: string
  ) => Promise<{ success: boolean; error?: string }>;
  onResume: (
    subscriptionId: string
  ) => Promise<{ success: boolean; error?: string }>;
}) => {
  const { openDialog } = useDialog();
  const { config } = usePluginConfig<PluginConfig>();
  const [isCanceling, setIsCanceling] = useState(false);
  const [isResuming, setIsResuming] = useState(false);
  const texts = config.texts.subscriptions;

  const handleCancelSubscription = async () => {
    try {
      setIsCanceling(true);
      await onCancel(subscription.id);
      refetch(); // Refetch subscriptions after successful cancellation
    } catch (error) {
      console.error("Error canceling subscription:", error);
    } finally {
      setIsCanceling(false);
    }
  };

  const handleResumeSubscription = async () => {
    try {
      setIsResuming(true);
      await onResume(subscription.id);
      refetch(); // Refetch subscriptions after successful resume
    } catch (error) {
      console.error("Error resuming subscription:", error);
    } finally {
      setIsResuming(false);
    }
  };

  const openCancellationDialog = () => {
    const isClubSubscription = subscription.productTitle
      ?.toLowerCase()
      .includes("club");

    let description: React.ReactNode;

    if (isClubSubscription) {
      description = (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">{texts.cancelClubMembership}</p>
          <div className="rounded-lg bg-amber-50 p-4">
            <h4 className="mb-2 font-medium text-amber-800">
              {texts.byCanceling}
            </h4>
            <ul className="list-inside space-y-2 text-sm text-amber-700">
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{texts.loseClubAdvantages}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{texts.loseAccumulatedCredits}</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="mt-1">•</span>
                <span>{texts.losePromotionCode}</span>
              </li>
            </ul>
          </div>
          <p className="text-sm font-medium text-gray-900">
            {texts.confirmProceed}
          </p>
        </div>
      );
    } else {
      description = (
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            {texts.cancelSubscriptionNotice}
          </p>
          <p className="text-sm font-medium text-gray-900">
            {texts.confirmProceed}
          </p>
        </div>
      );
    }

    openDialog({
      title: texts.cancelSubscriptionTitle,
      description,
      actions: [
        {
          label: isClubSubscription ? texts.yesLoseBenefits : texts.yesCancel,
          onClick: handleCancelSubscription,
          isConfirmation: true,
        },
        {
          label: texts.keepSubscription,
          onClick: () => {
            /* Close dialog */
          },
        },
      ],
    });
  };

  return (
    <div className="group h-full rounded-lg border border-gray-200 bg-white transition-all hover:border-gray-300 hover:shadow-md">
      <div className="border-b border-gray-100 bg-gray-50/50 p-3 sm:p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="rounded-full bg-white p-2 shadow-sm">
              <CreditCard className="h-5 w-5 text-gray-600" />
            </div>
            <div className="flex flex-col">
              <span className="font-medium text-gray-900">
                {subscription.productTitle}
              </span>
              <div className="flex items-center gap-2">
                {subscription.quantity > 1 && (
                  <span className="text-xs text-gray-500">
                    {texts.qty}: {subscription.quantity}
                  </span>
                )}
                <span className="text-xs text-gray-500">
                  {texts.id}: {subscription.id.slice(-6)}
                </span>
              </div>
            </div>
          </div>
          <StatusBadge
            status={
              subscription.cancelAtPeriodEnd ? "canceling" : subscription.status
            }
          />
        </div>
      </div>

      <div className="p-3 sm:p-4">
        {/* Subscription Price Information */}
        <div className="mb-4 pb-3 border-b border-gray-100">
          <div className="flex justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-700">
                {texts.billingPlan}
              </h4>
              <p className="text-sm text-gray-900">
                {new Intl.NumberFormat(undefined, {
                  style: "currency",
                  currency: subscription.currency,
                  minimumFractionDigits: 2,
                }).format(
                  (subscription.priceCurrencyOptions[subscription.currency]
                    ?.amount || 0) / 100
                )}
                {" / "}
                {subscription.priceIntervalCount > 1
                  ? `${subscription.priceIntervalCount} `
                  : ""}
                {subscription.priceInterval}
              </p>
            </div>
            <div className="text-right">
              <h4 className="text-sm font-medium text-gray-700">
                {texts.customer}
              </h4>
              <p className="text-sm text-gray-900 truncate max-w-[180px]">
                {subscription.customerName}
              </p>
              <p className="text-xs text-gray-500 truncate max-w-[180px]">
                {subscription.customerEmail}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 sm:gap-4 sm:grid-cols-2">
          {subscription.currentPeriodStart && subscription.currentPeriodEnd && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>{texts.currentPeriod}</span>
              </div>
              <div className="mt-2 text-xs sm:text-sm text-gray-900">
                {format(
                  new Date(subscription.currentPeriodStart),
                  "MMM d, yyyy"
                )}{" "}
                -{" "}
                {format(new Date(subscription.currentPeriodEnd), "MMM d, yyyy")}
              </div>
            </div>
          )}

          {subscription.trialEnd && (
            <div className="rounded-lg border border-gray-100 bg-gray-50 p-3 sm:p-4">
              <div className="flex items-center gap-2 text-sm font-medium text-gray-500">
                <Clock className="h-4 w-4" />
                <span>{texts.trialPeriod}</span>
              </div>
              <div className="mt-2 text-xs sm:text-sm text-gray-900">
                {format(new Date(subscription.createdAt), "MMM d, yyyy")} -{" "}
                {format(new Date(subscription.trialEnd), "MMM d, yyyy")}
              </div>
            </div>
          )}
        </div>

        <div className="mt-3 sm:mt-4">
          {subscription.cancelAtPeriodEnd && (
            <div className="rounded-lg border border-yellow-100 bg-yellow-50 p-3 sm:p-4 mb-3">
              <div className="flex items-center gap-2 text-sm font-medium text-yellow-800">
                <AlertCircle className="h-4 w-4" />
                <span>{texts.cancellationNotice}</span>
              </div>
              <p className="mt-2 text-xs sm:text-sm text-yellow-700">
                {texts.subscriptionCancellationEndPeriod}
              </p>
            </div>
          )}

          {/* Additional Details Footer */}
          <div className="flex justify-between text-xs text-gray-500 mb-3 border-t border-gray-100 pt-3">
            <div>
              <span>
                {texts.created}:{" "}
                {format(new Date(subscription.createdAt), "MMM d, yyyy")}
              </span>
            </div>
            <div>
              <span>
                {texts.productId}: {subscription.productId.slice(-6)}
              </span>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:justify-end gap-2">
            {subscription.cancelAtPeriodEnd && (
              <Button
                variant="light"
                className="w-full sm:w-auto text-emerald-600 hover:bg-emerald-50"
                onClick={handleResumeSubscription}
                disabled={isResuming}
              >
                {isResuming ? texts.resuming : texts.resumeSubscription}
              </Button>
            )}
            {!subscription.cancelAtPeriodEnd &&
              subscription.status !== "canceled" && (
                <Button
                  variant="ghost"
                  className="w-full sm:w-auto text-red-600 hover:bg-red-50"
                  onClick={openCancellationDialog}
                  disabled={isCanceling}
                >
                  {isCanceling ? texts.canceling : texts.cancelSubscription}
                </Button>
              )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function MySubscriptionsTab() {
  const { config } = usePluginConfig<PluginConfig>();
  const texts = config.texts.subscriptions;
  const { customer } = useCustomer();
  const { data, isLoading, refetch, resumeSubscription, cancelSubscription } =
    useCustomerSubscriptions({
      customerId: customer?.id,
      enabled: Boolean(customer?.id),
    });

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="text-center">
          <div className="mx-auto h-10 w-10 animate-spin rounded-full border-4 border-emerald-500 border-t-transparent"></div>
          <p className="mt-4 text-sm text-emerald-600">
            {texts.loadingSubscriptions}
          </p>
        </div>
      </div>
    );
  }

  const subscriptions = data?.items ?? [];

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div className="space-y-1 sm:space-y-2">
          <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
            {texts.mySubscriptions}
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            <CustomerIdBadge customerId={customer?.id || ""} />
            <span className="text-xs sm:text-sm text-gray-500">
              {subscriptions.length} {texts.subscriptionsLabel}
            </span>
          </div>
        </div>
      </div>

      {subscriptions.length === 0 ? (
        <div className="flex min-h-[200px] sm:min-h-[300px] flex-col items-center justify-center rounded-lg bg-gray-50 p-4 sm:p-8">
          <div className="rounded-full bg-gray-100 p-3">
            <CreditCard className="h-8 w-8 text-gray-400" />
          </div>
          <p className="mt-4 text-gray-600">{texts.noActiveSubscriptions}</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:gap-6">
          {subscriptions.map((subscription) => (
            <SubscriptionCard
              key={subscription.id}
              subscription={subscription}
              refetch={refetch}
              onCancel={cancelSubscription}
              onResume={resumeSubscription}
            />
          ))}
        </div>
      )}
    </div>
  );
}
