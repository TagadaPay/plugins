import { cn, getColorOpacityFromCSSVar } from '@/lib/utils';
import { PluginConfigData } from '@/types/plugin-config';
import { usePluginConfig, useTranslation } from '@tagadapay/plugin-sdk/v2';
import { useEffect, useState } from 'react';

interface TimeLeftDisplayProps {
  textColor?: string;
  seconds?: number;
}

function TimeLeftDisplay({ textColor, seconds }: TimeLeftDisplayProps) {
  const [timeLeft, setTimeLeft] = useState<number>();

  useEffect(() => {
    if (seconds) {
      setTimeLeft(seconds * 1000);
    }
  }, [seconds]);

  useEffect(() => {
    if (timeLeft && timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(Math.max(0, timeLeft - 1000));
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  useEffect(() => {
    // Apply the primary color as CSS custom property
    if (textColor) {
      document.documentElement.style.setProperty('--scarcity-text-color', textColor);
    }
  }, [textColor]);

  const formatDuration = (ms: number): string => {
    const totalSeconds = Math.floor(ms / 1000);
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    const pad2 = (n: number) => String(n).padStart(2, '0');

    const parts: string[] = [];
    if (days > 0) parts.push(`${pad2(days)}d`);
    if (hours > 0) parts.push(`${pad2(hours)}h`);
    if (minutes > 0) parts.push(`${pad2(minutes)}m`);
    if (seconds > 0 || parts.length === 0) parts.push(`${pad2(seconds)}s`);

    return parts.join(' ');
  };

  return formatDuration(timeLeft || 0);
}

interface ScarcityProps {
  /**
   * Which config field to read scarcity settings from.
   * - "checkoutScarcity" for the checkout page
   * - "offerScarcity" for the offer page
   */
  configKey?: 'checkoutScarcity' | 'offerScarcity';
}

function Scarcity({ configKey = 'checkoutScarcity' }: ScarcityProps) {
  const { config } = usePluginConfig<PluginConfigData>();
  const { t } = useTranslation();

  const scarcity = configKey === 'checkoutScarcity' ? config?.checkoutScarcity : config?.offerScarcity;

  const editorPrefix = configKey === 'checkoutScarcity' ? 'config.checkoutScarcity' : 'config.offerScarcity';

  const textColor = scarcity?.color;

  return (
    scarcity?.enabled &&
    scarcity.seconds && (
      <div editor-id={`${editorPrefix}.enabled`}>
        <div
          className={cn(
            'flex items-center justify-between gap-3 rounded-[4px] border border-[var(--primary-color)] px-3.5 py-2.5',
            {
              '[&>*]:text-[var(--scarcity-text-color)]': textColor,
              '[&>*]:text-[var(--text-color-on-primary)]': !textColor,
            },
          )}
          style={{ backgroundColor: getColorOpacityFromCSSVar('primary-color', 8) }}
          editor-id={`${editorPrefix}.color`}
        >
          <span className="text-[13px] font-medium uppercase tracking-[0.12em]" editor-id={`${editorPrefix}.messageTrans`}>
            {t(scarcity?.messageTrans, 'Time left')}
          </span>
          <div
            editor-id={`${editorPrefix}.seconds`}
            className="money min-w-[120px] shrink-0 text-right text-[15px] font-medium tabular-nums"
          >
            <TimeLeftDisplay textColor={textColor} seconds={scarcity.seconds} />
          </div>
        </div>
      </div>
    )
  );
}

export default Scarcity;
