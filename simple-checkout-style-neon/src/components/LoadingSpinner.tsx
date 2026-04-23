import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';

interface LoadingSpinnerProps {
  text?: string;
  editorId?: string;
}

export default function LoadingSpinner({ text, editorId }: LoadingSpinnerProps) {
  const { t } = useTranslation();
  const { config } = usePluginConfig<PluginConfigData>();

  return (
    <div className="bg-[var(--background-color)] flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-[var(--border-color)] border-t-[var(--primary-color)]"></div>
        <p className="mt-2 text-[var(--text-secondary-color)]" editor-id={editorId}>
          {text || t(config.checkout?.loading?.defaultText, 'Loading...')}
        </p>
      </div>
    </div>
  );
}

