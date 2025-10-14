"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { useCustomer, useCustomerInfos } from "@tagadapay/plugin-sdk/react";
import { Check, Clock, Gift, Mail, MapPin, User } from "lucide-react";
import { useState } from "react";
import toast from "react-hot-toast";

// Hardcoded data
const USER_CREDITS = 7;
const NEXT_CREDIT_DATE = "November 1, 2025";

const REDEEMABLE_ITEMS = [
  {
    id: 1,
    name: "Free Shipping Voucher",
    description: "Get free shipping on your next order",
    creditsRequired: 3,
    image: "🚚",
  },
  {
    id: 2,
    name: "10% Discount Code",
    description: "Save 10% on any purchase",
    creditsRequired: 5,
    image: "🎫",
  },
  {
    id: 3,
    name: "Exclusive Product Sample",
    description: "Try our latest product for free",
    creditsRequired: 7,
    image: "🎁",
  },
  {
    id: 4,
    name: "VIP Early Access",
    description: "Get early access to new releases",
    creditsRequired: 8,
    image: "⭐",
  },
  {
    id: 5,
    name: "Premium Gift Box",
    description: "Receive a curated gift box",
    creditsRequired: 10,
    image: "📦",
  },
  {
    id: 6,
    name: "20% Discount Code",
    description: "Save 20% on any purchase",
    creditsRequired: 9,
    image: "💎",
  },
];

export function CreditRedeemSection() {
  const { customer } = useCustomer();
  const { data, isLoading: isLoadingCustomer } = useCustomerInfos({
    customerId: customer?.id,
    enabled: Boolean(customer?.id),
  });
  const [isRedeeming, setIsRedeeming] = useState(false);

  const customerData = data?.customer;

  const canRedeem = (creditsRequired: number) =>
    USER_CREDITS >= creditsRequired;

  const getProgressPercentage = (creditsRequired: number) => {
    return Math.min((USER_CREDITS / creditsRequired) * 100, 100);
  };

  const getProgressColor = (creditsRequired: number) => {
    const canAfford = canRedeem(creditsRequired);
    return canAfford ? "bg-green-500" : "bg-[var(--primary-color)]";
  };

  const handleRedeemItem = async (itemName: string) => {
    setIsRedeeming(true);
    const toastId = toast.loading("Processing redemption...");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success(`Successfully redeemed ${itemName}!`, {
        id: toastId,
      });
    } catch (error) {
      console.error("Redemption error:", error);
      toast.error("Failed to redeem item. Please try again.", {
        id: toastId,
      });
    } finally {
      setIsRedeeming(false);
    }
  };

  return (
    <section
      id="credits"
      className="w-full py-12 md:py-24 lg:py-32 bg-zinc-50 dark:bg-zinc-900"
    >
      <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex flex-col items-center justify-center space-y-4 text-center">
          <div className="space-y-2">
            <Badge className="text-white bg-[var(--primary-color)]">
              <Gift className="w-3 h-3 mr-1" />
              Credit Rewards
            </Badge>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-5xl">
              Redeem Your Credits
            </h2>
            <p className="mx-auto max-w-[700px] text-zinc-500 dark:text-zinc-400 md:text-xl/relaxed lg:text-base/relaxed xl:text-xl/relaxed">
              Earn credits with every purchase and redeem them for exclusive
              rewards
            </p>
          </div>

          {/* Credits Status */}
          <div className="flex flex-col sm:flex-row items-center gap-6 mt-6 p-6 bg-white dark:bg-zinc-800 rounded-lg shadow-sm w-full max-w-2xl">
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Your Credits
              </p>
              <p className="text-4xl font-bold text-[var(--primary-color)] mt-1">
                {USER_CREDITS}
              </p>
            </div>
            <div className="h-12 w-px bg-zinc-200 dark:bg-zinc-700 hidden sm:block" />
            <div className="flex-1 text-center sm:text-left">
              <p className="text-sm text-zinc-500 dark:text-zinc-400 flex items-center justify-center sm:justify-start gap-1">
                <Clock className="w-4 h-4" />
                Next Credits
              </p>
              <p className="text-lg font-semibold text-zinc-700 dark:text-zinc-300 mt-1">
                {NEXT_CREDIT_DATE}
              </p>
            </div>
          </div>
        </div>

        {/* Redeemable Items Grid */}
        <div className="mx-auto grid max-w-6xl grid-cols-1 gap-6 py-12 sm:grid-cols-2 lg:grid-cols-3">
          {REDEEMABLE_ITEMS.map((item) => {
            const isAffordable = canRedeem(item.creditsRequired);
            const progressPercentage = getProgressPercentage(
              item.creditsRequired
            );
            const progressColor = getProgressColor(item.creditsRequired);

            return (
              <Card
                key={item.id}
                className="flex flex-col overflow-hidden transition-all hover:shadow-lg"
              >
                {/* Item Icon */}
                <div className="p-6 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center">
                  <div className="text-6xl">{item.image}</div>
                </div>

                {/* Item Details */}
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-lg font-semibold mb-2">{item.name}</h3>
                  <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-4 flex-1">
                    {item.description}
                  </p>

                  {/* Credits Progress Bar */}
                  <div className="mb-4">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
                        Credits Required
                      </span>
                      <span className="text-xs font-bold text-zinc-700 dark:text-zinc-300">
                        {USER_CREDITS}/{item.creditsRequired}
                      </span>
                    </div>
                    <div className="w-full bg-zinc-200 dark:bg-zinc-700 rounded-full h-2 overflow-hidden">
                      <div
                        className={`h-full ${progressColor} transition-all duration-300 rounded-full`}
                        style={{ width: `${progressPercentage}%` }}
                      />
                    </div>
                  </div>

                  {/* Redeem Button */}
                  {isAffordable ? (
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button
                          className="w-full text-white"
                          style={{
                            backgroundColor: "var(--primary-color)",
                          }}
                        >
                          Redeem Now
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="h-[100dvh] w-full overflow-y-auto border-0 bg-white p-0 dark:bg-zinc-900 sm:h-auto sm:max-h-[85vh] sm:max-w-[600px] sm:rounded-lg">
                        <div className="flex h-full flex-col sm:h-auto">
                          {/* Modal Header with Item */}
                          <div className="relative h-32 w-full overflow-hidden sm:h-48 bg-gradient-to-br from-zinc-50 to-white dark:from-zinc-800 dark:to-zinc-900">
                            <div className="absolute inset-0 flex items-center justify-center">
                              <div className="text-8xl">{item.image}</div>
                            </div>
                            <div className="absolute inset-0 flex items-end bg-gradient-to-t from-black/70 to-transparent">
                              <div className="w-full p-4 sm:p-6">
                                <Badge className="mb-2 text-white bg-[var(--primary-color)]">
                                  {item.creditsRequired} Credits
                                </Badge>
                                <h2 className="text-xl font-bold text-white sm:text-2xl">
                                  {item.name}
                                </h2>
                                <p className="mt-1 text-sm text-zinc-200">
                                  {item.description}
                                </p>
                              </div>
                            </div>
                          </div>

                          <div className="flex-1 overflow-y-auto">
                            <div className="p-4 sm:p-6 space-y-6">
                              {/* Redemption Info */}
                              <div className="space-y-3 pb-6 border-b">
                                <h3 className="text-lg font-semibold flex items-center gap-2">
                                  <Check className="h-5 w-5 text-green-500" />
                                  Ready to Redeem
                                </h3>
                                <p className="text-sm text-zinc-500 dark:text-zinc-400">
                                  You have enough credits to redeem this item.
                                  Once confirmed,
                                  {item.creditsRequired} credits will be
                                  deducted from your account.
                                </p>
                                <div className="flex items-center justify-between p-3 bg-primary-50 dark:bg-primary-950/30 rounded-lg">
                                  <span className="text-sm font-medium">
                                    Your Credits after redemption
                                  </span>
                                  <span className="text-lg font-bold text-[var(--primary-color)]">
                                    {USER_CREDITS} →{" "}
                                    {USER_CREDITS - item.creditsRequired}
                                  </span>
                                </div>
                              </div>

                              {/* Customer Information */}
                              {isLoadingCustomer ? (
                                <div className="flex items-center justify-center py-8">
                                  <div className="h-8 w-8 animate-spin rounded-full border-4 border-[var(--primary-color)] border-t-transparent"></div>
                                </div>
                              ) : customerData ? (
                                <div className="space-y-4">
                                  <h3 className="text-lg font-semibold flex items-center gap-2">
                                    <User className="h-5 w-5 text-[var(--primary-color)]" />
                                    Delivery Information
                                  </h3>

                                  {/* Personal Info */}
                                  <div className="space-y-3 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                                    <div className="flex items-start gap-3">
                                      <User className="h-5 w-5 text-zinc-400 mt-0.5" />
                                      <div className="flex-1">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                          Full Name
                                        </p>
                                        <p className="text-sm font-medium">
                                          {customerData.firstName}{" "}
                                          {customerData.lastName}
                                        </p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <Mail className="h-5 w-5 text-zinc-400 mt-0.5" />
                                      <div className="flex-1">
                                        <p className="text-xs text-zinc-500 dark:text-zinc-400">
                                          Email
                                        </p>
                                        <p className="text-sm font-medium">
                                          {customerData.email}
                                        </p>
                                      </div>
                                    </div>
                                  </div>

                                  {/* Shipping Address */}
                                  {customerData.shippingAddress && (
                                    <div className="space-y-2 rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                                      <div className="flex items-start gap-3">
                                        <MapPin className="h-5 w-5 text-zinc-400 mt-0.5" />
                                        <div className="flex-1">
                                          <p className="text-xs text-zinc-500 dark:text-zinc-400 mb-1">
                                            Shipping Address
                                          </p>
                                          <p className="text-sm font-medium">
                                            {
                                              (
                                                customerData.shippingAddress as any
                                              ).firstName
                                            }{" "}
                                            {
                                              (
                                                customerData.shippingAddress as any
                                              ).lastName
                                            }
                                          </p>
                                          <p className="text-sm">
                                            {
                                              customerData.shippingAddress
                                                .address1
                                            }
                                          </p>
                                          <p className="text-sm">
                                            {
                                              (
                                                customerData.shippingAddress as any
                                              ).city
                                            }
                                            ,{" "}
                                            {
                                              (
                                                customerData.shippingAddress as any
                                              ).state
                                            }{" "}
                                            {
                                              (
                                                customerData.shippingAddress as any
                                              ).zip
                                            }
                                          </p>
                                          <p className="text-sm">
                                            {
                                              customerData.shippingAddress
                                                .country
                                            }
                                          </p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  {!customerData.shippingAddress && (
                                    <div className="rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-800 dark:bg-amber-950/30 p-4">
                                      <p className="text-sm text-amber-800 dark:text-amber-200">
                                        No shipping address on file. Please
                                        update your account information.
                                      </p>
                                    </div>
                                  )}
                                </div>
                              ) : (
                                <div className="rounded-lg border border-zinc-200 dark:border-zinc-700 p-4">
                                  <p className="text-sm text-zinc-500">
                                    Unable to load customer information. Please
                                    try again.
                                  </p>
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Sticky Bottom Button */}
                          <div className="sticky bottom-0 left-0 right-0 border-t border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-900 sm:p-6">
                            <Button
                              type="submit"
                              className="h-12 w-full text-base text-white transition-opacity hover:opacity-90"
                              style={{
                                backgroundColor: "var(--primary-color)",
                              }}
                              onClick={() => handleRedeemItem(item.name)}
                              disabled={
                                isRedeeming || !customerData?.shippingAddress
                              }
                            >
                              {isRedeeming ? (
                                <>
                                  <div className="mr-2 h-5 w-5 animate-spin rounded-full border-2 border-zinc-200 border-t-zinc-600"></div>
                                  Processing Redemption...
                                </>
                              ) : (
                                <>
                                  <Gift className="mr-2 h-5 w-5" />
                                  Confirm Redemption • {
                                    item.creditsRequired
                                  }{" "}
                                  Credits
                                </>
                              )}
                            </Button>
                          </div>
                        </div>
                      </DialogContent>
                    </Dialog>
                  ) : (
                    <Button className="w-full" disabled>
                      Need {item.creditsRequired - USER_CREDITS} More
                    </Button>
                  )}
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
