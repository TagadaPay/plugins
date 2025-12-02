import { Button } from "@/components/ui/button";
import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig, useTranslation } from "@tagadapay/plugin-sdk";

interface PostPurchasePayButtonProps {
  handlePay: () => void;
  isProcessingPayment: boolean;
}

function PostPurchasePayButton({
  handlePay,
  isProcessingPayment,
}: PostPurchasePayButtonProps) {
  const { t } = useTranslation();
  const { config: pluginConfig } = usePluginConfig<PluginConfig>();
  const actionsContent = pluginConfig.content?.postPurchase?.actions;
  return (
    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-8">
      <Button
        onClick={handlePay}
        disabled={isProcessingPayment}
        className="bg-gradient-to-r h-auto from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white font-bold md:px-[200px] sm:px-15 px-10 py-5 rounded-lg shadow-lg text-2xl sm:text-3xl md:text-5xl max-w-full"
      >
        {isProcessingPayment
          ? t(actionsContent?.processingLabel)
          : t(actionsContent?.confirmLabel)}
      </Button>
    </div>
  );
}

export default PostPurchasePayButton;
