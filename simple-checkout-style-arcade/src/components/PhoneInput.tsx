import { ChangeEvent, useCallback, useRef } from 'react';
import { RefCallBack } from 'react-hook-form';
import { Input } from './Input';

type AsYouTypeCtor = typeof import('libphonenumber-js/min').AsYouType;

interface PhoneInputProps {
  ref: RefCallBack;
  name?: string;
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: string;
  'editor-id'?: string;
}

const sanitizePhoneValue = (value: string) => {
  if (!value) {
    return '';
  }

  const digitsWithPlus = value.replace(/[^\d+]/g, '');

  if (!digitsWithPlus) {
    return '';
  }

  const [firstChar, ...rest] = digitsWithPlus;
  const normalized =
    firstChar === '+' ? `+${rest.join('').replace(/\+/g, '')}` : digitsWithPlus.replace(/\+/g, '');

  return normalized;
};

let _AsYouType: AsYouTypeCtor | null = null;
const _loadPromise = import('libphonenumber-js/min').then((m) => { _AsYouType = m.AsYouType; });

const formatPhoneValue = (value: string) => {
  const sanitized = sanitizePhoneValue(value);
  if (!sanitized) return '';
  if (!_AsYouType) return sanitized;
  const formatter = new _AsYouType();
  return formatter.input(sanitized) || sanitized;
};

function PhoneInput({
  ref,
  name,
  value = '',
  onChange,
  placeholder = 'Phone number',
  className,
  error,
  'editor-id': editorId,
}: PhoneInputProps) {
  const loadedRef = useRef(!!_AsYouType);

  const handleChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      if (!onChange) return;

      const rawValue = event.target.value;

      if (!loadedRef.current) {
        _loadPromise.then(() => {
          loadedRef.current = true;
          onChange(formatPhoneValue(rawValue));
        });
        onChange(sanitizePhoneValue(rawValue));
        return;
      }

      onChange(formatPhoneValue(rawValue));
    },
    [onChange],
  );

  const displayValue = _AsYouType ? formatPhoneValue(value) : sanitizePhoneValue(value);

  return (
    <Input
      ref={ref}
      name={name}
      autoComplete="tel"
      value={displayValue}
      onChange={handleChange}
      placeholder={placeholder}
      type="tel"
      inputMode="tel"
      aria-invalid={!!error}
      className={className}
      error={error}
      editor-id={editorId}
    />
  );
}

export default PhoneInput;
