import { Switch } from '@/components/ui/switch';
import { useVipOffersContext } from '@/contexts/VipOffersContext';
import { PluginConfigData } from '@/types/plugin-config';
import {
  CheckoutData,
  CheckoutLineItem,
  formatMoney,
  usePluginConfig,
  useTagadaContext,
  useTranslation,
} from '@tagadapay/plugin-sdk/v2';

interface BrandedVipOfferProps {
  checkout: CheckoutData | undefined;
  updateLineItems: (lineItems: CheckoutLineItem[]) => void;
  refresh: () => Promise<void>;
}

function BrandedVipOffer({ checkout, updateLineItems, refresh }: BrandedVipOfferProps) {
  const { t, locale } = useTranslation();
  const { config: pluginConfig } = usePluginConfig<PluginConfigData>();
  const summary = checkout?.summary;
  const customerCurrency = checkout?.checkoutSession.customer?.currency ?? '';
  const { offers, vipPreview, isOfferSelected, selectVipOffers, cancelVipOffers, isLoadingVipPreview } =
    useVipOffersContext();
  const { refreshCoordinator } = useTagadaContext();
  const checkoutSessionId = checkout?.checkoutSession?.id;

  const handleOrderBumpChange = async (selected: boolean) => {
    if (!checkoutSessionId) {
      console.error('No checkout session ID available');
      return;
    }

    try {
      await (selected ? selectVipOffers() : cancelVipOffers());
      await refreshCoordinator.notifyOrderBumpChanged();
      await refresh();
    } catch (error) {
      console.error('Error toggling VIP order bump:', error);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      {offers.map((offer) => {
        const title = offer.titleTrans.en;
        const logoUrl = pluginConfig?.checkout?.orderBumps?.vipLogoUrl;
        const price = offer.price?.currencyOptions?.[customerCurrency]?.amount;
        const savings = vipPreview?.savings ?? 0;
        const offerVariantId = offer.variant?.id;

        return (
          <div key={offer.id}>
            <div className="flex flex-col overflow-hidden rounded-lg border border-[var(--primary-color)]">
              <div className="bg-[var(--primary-color)] py-2 text-center font-bold text-white">
                Join {title}
              </div>
              <div className="mx-4 mt-6 grid grid-cols-[auto_1fr_auto] gap-4">
                {logoUrl ? <img src={logoUrl} alt="title" className="mx-auto h-auto w-[74px]" /> : <div />}
                <span className="text-md flex-grow font-semibold">{title}</span>
                <Switch
                  className="ml-auto"
                  onCheckedChange={(checked: boolean) => handleOrderBumpChange(checked)}
                  checked={isOfferSelected(offer)}
                />
                {summary &&
                  summary?.items
                    .filter((item) => item.variantId !== offerVariantId)
                    .map((item) => (
                      <>
                        <img src={item.variant.imageUrl} alt={item.variant.name} className="size-[100px]" />
                        <div>
                          <p className="text-lg font-bold">{item.variant.name}</p>
                          <p className="text-md">{item.variant.description}</p>
                          <div className="mt-2 flex items-center gap-2">
                            <div className="flex items-center rounded border border-gray-300 bg-white">
                              <button
                                type="button"
                                className={`rounded-l px-2 py-1 text-gray-600 hover:bg-gray-100 ${
                                  item.quantity <= 1 ? 'cursor-not-allowed opacity-50' : ''
                                }`}
                                disabled={item.quantity <= 1}
                                onClick={() => {
                                  if (item.quantity > 1) {
                                    const updatedItems = summary.items.map((lineItem) =>
                                      lineItem.id === item.id
                                        ? { ...lineItem, quantity: lineItem.quantity - 1 }
                                        : lineItem,
                                    );
                                    updateLineItems(updatedItems);
                                  }
                                }}
                              >
                                -
                              </button>
                              <input
                                type="number"
                                value={item.quantity}
                                className="w-12 border-0 px-2 py-1 text-center focus:outline-none"
                                min="1"
                                onChange={(e) => {
                                  const newQuantity = parseInt(e.target.value) || 1;
                                  if (newQuantity >= 1) {
                                    const updatedItems = summary.items.map((lineItem) =>
                                      lineItem.id === item.id
                                        ? { ...lineItem, quantity: newQuantity }
                                        : lineItem,
                                    );
                                    updateLineItems(updatedItems);
                                  }
                                }}
                              />
                              <button
                                type="button"
                                className="rounded-r px-2 py-1 text-gray-600 hover:bg-gray-100"
                                onClick={() => {
                                  const updatedItems = summary.items.map((lineItem) =>
                                    lineItem.id === item.id
                                      ? { ...lineItem, quantity: lineItem.quantity + 1 }
                                      : lineItem,
                                  );
                                  updateLineItems(updatedItems);
                                }}
                              >
                                +
                              </button>
                            </div>
                            <button
                              type="button"
                              className="rounded p-1 text-gray-500 hover:bg-red-50 hover:text-red-500"
                              onClick={() => {
                                const updatedItems = summary.items.filter(
                                  (lineItem) => lineItem.id !== item.id,
                                );
                                updateLineItems(updatedItems);
                              }}
                            >
                              <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 20 20">
                                <path
                                  fillRule="evenodd"
                                  d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z"
                                  clipRule="evenodd"
                                />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="my-auto text-right">
                          {vipPreview?.savings ? (
                            <p className="text-xs text-gray-400 line-through">
                              {formatMoney(item.unitAmount, item.currency, locale)}
                            </p>
                          ) : (
                            <div />
                          )}
                          <p className="text-md">
                            {formatMoney(item.unitAmount - (vipPreview?.savings ?? 0), item.currency, locale)}
                          </p>
                        </div>
                      </>
                    ))}
              </div>
              <div className="relative my-4 px-2 py-1 text-center">
                <div className="-z-1 absolute inset-0 bg-[var(--primary-color)] opacity-20"></div>
                <span className="z-1 text-xs">
                  Membership automatically renews at {formatMoney(price, customerCurrency, locale)}/month. Cancel any time in your
                  account
                </span>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default BrandedVipOffer;
