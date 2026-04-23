import { cn } from '@/lib/utils';
import { CardNetwork } from '@/types/card-network';
import { useState } from 'react';
import { RefCallBack } from 'react-hook-form';
import { PatternFormat } from 'react-number-format';
import { CARD_NETWORK_IMAGES, CARD_PATTERNS } from '../data/card-network';
import { Input } from './ui/input';

interface CardInputProps {
  ref: RefCallBack;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
  'editor-id'?: string;
  disabled?: boolean;
}

function detectCardNetwork(raw: string): CardNetwork | null {
  const digits = raw.replace(/\D/g, '');

  if (!digits) {
    return null;
  }

  // 1) Handle Elo vs Visa carefully (overlapping BIN ranges)
  const eloRegex = CARD_PATTERNS[CardNetwork.ELO];
  const visaRegex = CARD_PATTERNS[CardNetwork.VISA];

  // If it matches Elo at any stage, we immediately classify as Elo
  // (Elo has specific BINs that overlap Visa).
  if (eloRegex && eloRegex.test(digits)) {
    return CardNetwork.ELO;
  }

  // Only consider Visa once we have at least a full BIN (6 digits);
  // before that, we don't want to prematurely show Visa when it could still be Elo.
  if (digits.length >= 6 && visaRegex && visaRegex.test(digits)) {
    return CardNetwork.VISA;
  }

  // 2) Check all other networks (they don't overlap with Elo/Visa in the same way)
  for (const [network, regex] of Object.entries(CARD_PATTERNS) as [CardNetwork, RegExp][]) {
    if (network === CardNetwork.ELO || network === CardNetwork.VISA) continue;
    if (regex.test(digits)) {
      return network;
    }
  }

  return null;
}

function CardInput({
  ref,
  name,
  value = '',
  onChange,
  placeholder = 'Card number',
  className,
  error = false,
  'editor-id': editorId,
  disabled = false,
}: CardInputProps) {
  const [cardNetwork, setCardNetwork] = useState<CardNetwork | null>(null);

  return (
    <div className="relative">
      <PatternFormat
        getInputRef={ref}
        name={name}
        value={value}
        onValueChange={(values) => {
          const network = detectCardNetwork(values.value);
          setCardNetwork(network);
          if (network) {
            console.log('Detected card network:', network);
          }

          if (onChange) {
            onChange(values.formattedValue);
          }
        }}
        format="#### #### #### #### ###"
        allowEmptyFormatting={false}
        customInput={Input}
        placeholder={placeholder}
        className={cn('h-12 px-4 pr-12 text-base', error ? 'border-[var(--danger)]' : '', className)}
        editor-id={editorId}
        disabled={disabled}
      />

      {cardNetwork && (
        <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
          <img
            key={cardNetwork}
            src={CARD_NETWORK_IMAGES[cardNetwork]}
            alt={cardNetwork}
            className="h-8 w-auto animate-[fadeScaleIn_0.15s_ease-out]"
          />
        </div>
      )}
    </div>
  );
}

export default CardInput;
