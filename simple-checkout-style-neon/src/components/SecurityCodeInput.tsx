import { cn } from '@/lib/utils';
import { RefCallBack } from 'react-hook-form';
import { PatternFormat } from 'react-number-format';
import { Input } from './ui/input';

interface SecurityCodeInputProps {
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

function SecurityCodeInput({
  ref,
  name,
  value = '',
  onChange,
  placeholder = 'Security code',
  className,
  error = false,
  'editor-id': editorId,
  disabled = false,
}: SecurityCodeInputProps) {
  return (
    <PatternFormat
      getInputRef={ref}
      name={name}
      value={value}
      onValueChange={(values) => {
        if (onChange) {
          onChange(values.value);
        }
      }}
      format="####"
      allowEmptyFormatting={false}
      customInput={Input}
      placeholder={placeholder}
      className={cn('h-12 px-4 text-base', error ? 'border-[var(--danger)]' : '', className)}
      editor-id={editorId}
      disabled={disabled}
    />
  );
}

export default SecurityCodeInput;
