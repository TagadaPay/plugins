import { Checkbox } from "@/components/ui/checkbox";
import { PluginConfig } from "@/types/plugin-config";
import {
  useOrderBump,
  usePluginConfig,
  useTranslation,
} from "@tagadapay/plugin-sdk/v2";
import { Heart } from "lucide-react";
import { toast } from "react-hot-toast";

interface OrderBumpProps {
  checkoutToken?: string;
  orderBumpId?: string; // Order bump ID from static resources
}

function OrderBump({ checkoutToken, orderBumpId }: OrderBumpProps) {
  // Early return if no checkout token
  if (!checkoutToken) {
    return null;
  }
  const { config: pluginConfig } = usePluginConfig<PluginConfig>();
  const { t } = useTranslation();

  const { isSelected: orderBumpSelected, toggle: toggleOrderBumpOffer } =
    useOrderBump({
      checkoutToken: checkoutToken,
      offerId: orderBumpId || "",
    });

  const handleOrderBumpToggle = async (selected: boolean) => {
    // 🔄 BACKGROUND PROCESSING - Update backend without blocking UI
    try {
      const result = await toggleOrderBumpOffer(selected);

      if (result.success) {
        console.log("✅ Order bump background update completed successfully");

        // SDK automatically handles bidirectional refresh - no manual refresh needed! 🎉
        const message = selected
          ? String(
              t(pluginConfig.content?.checkout?.toasts?.orderBumpAdded, "")
            )
          : String(
              t(pluginConfig.content?.checkout?.toasts?.orderBumpRemoved, "")
            );
        toast.success(message, { duration: 2000 });
      } else {
        console.error("❌ Order bump update failed:", result);
        toast.error(
          String(t(pluginConfig.content?.checkout?.toasts?.orderBumpFailed, ""))
        );
      }
    } catch (error) {
      console.error("❌ Order bump toggle failed:", error);
      toast.error(
        String(t(pluginConfig.content?.checkout?.toasts?.orderBumpFailed, ""))
      );
    }
  };

  return (
    <div
      className={`relative cursor-pointer touch-manipulation select-none rounded-xl border-2 p-5 shadow-sm transition-all duration-300 sm:p-6 ${
        orderBumpSelected
          ? "border-emerald-500 bg-emerald-50 shadow-sm ring-1 ring-emerald-200"
          : "border-slate-300 bg-slate-50 hover:bg-slate-100 hover:shadow-sm active:scale-[0.98]"
      }`}
      onClick={() => handleOrderBumpToggle(!orderBumpSelected)}
    >
      <div className="absolute -right-2 -top-2 rounded-full bg-blue-600 px-3 py-1 text-xs font-semibold text-white shadow-sm">
        {t(pluginConfig.content?.checkout?.orderBump?.badgeLabel)}
      </div>

      <div className="flex items-start gap-4">
        <div
          className="flex h-7 w-7 items-center justify-center"
          onClick={(e) => e.stopPropagation()}
        >
          <Checkbox
            id="order-bump-expedited-shipping"
            checked={orderBumpSelected}
            onCheckedChange={(checked) => handleOrderBumpToggle(!!checked)}
            className={`h-6 w-6 border-2 transition-all duration-200 ${
              orderBumpSelected
                ? "border-emerald-500 bg-emerald-500 data-[state=checked]:bg-emerald-500"
                : "border-slate-400 hover:border-slate-500 data-[state=checked]:bg-slate-500"
            }`}
          />
        </div>

        <div className="flex-1">
          <div className="mb-3 flex items-center gap-2">
            <div
              className={`rounded-full p-1 ${
                orderBumpSelected ? "bg-emerald-500" : "bg-slate-500"
              }`}
            >
              <Heart className="h-4 w-4 text-white" />
            </div>
            <span
              className={`text-base font-semibold tracking-wide ${
                orderBumpSelected ? "text-emerald-700" : "text-slate-700"
              }`}
            >
              {t(pluginConfig.content?.checkout?.orderBump?.title)}
            </span>
            {orderBumpSelected && (
              <span className="ml-auto rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-semibold text-white">
                {t(pluginConfig.content?.checkout?.orderBump?.addedBadge)}
              </span>
            )}
          </div>
          <div className="space-y-2">
            <h4 className="text-lg font-semibold text-gray-900 sm:text-xl">
              {t(pluginConfig.content?.checkout?.orderBump?.headline)}
            </h4>
            <p
              className="text-base leading-relaxed text-gray-700"
              dangerouslySetInnerHTML={{
                __html: t(
                  pluginConfig.content?.checkout?.orderBump?.description
                ),
              }}
            />
            <div className="mt-3 grid grid-cols-1 gap-2 text-sm text-gray-600 sm:grid-cols-2">
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span>
                  {t(
                    pluginConfig.content?.checkout?.orderBump
                      ?.priorityProcessing
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span>
                  {t(pluginConfig.content?.checkout?.orderBump?.fasterDelivery)}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span>
                  {t(
                    pluginConfig.content?.checkout?.orderBump?.trackingIncluded
                  )}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-emerald-600">✓</span>
                <span>
                  {t(
                    pluginConfig.content?.checkout?.orderBump?.dedicatedSupport
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default OrderBump;
