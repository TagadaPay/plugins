import { cn } from '@/lib/utils';
import { RefCallBack } from 'react-hook-form';
import { NumberFormatBase } from 'react-number-format';
import { Input } from './ui/input';

interface ExpiryInputProps {
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

function ExpiryInput({
  ref,
  name,
  value = '',
  onChange,
  placeholder = 'MM / YY',
  className,
  error = false,
  'editor-id': editorId,
  disabled = false,
}: ExpiryInputProps) {
  const format = (val: string) => {
    if (val === '') return '';

    let month = val.substring(0, 2);
    const year = val.substring(2, 4);

    if (month.length === 1 && month[0] > '1') {
      month = `0${month[0]}`;
    } else if (month.length === 2) {
      // set the lower and upper boundary
      if (Number(month) === 0) {
        month = `01`;
      } else if (Number(month) > 12) {
        month = '12';
      }
    }

    return `${month}${year.length ? '/' + year : ''}`;
  };

  const onKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const target = e.target as HTMLInputElement;
    const { value, selectionStart } = target;

    if (e.key === '/' && selectionStart !== null && value[selectionStart] === '/') {
      // if there is number before slash with just one character add 0 prefix
      if (value.split('/')[0].length === 1) {
        target.value = `0${value}`;
        target.selectionStart = selectionStart + 1;
      }
      target.selectionStart = selectionStart + 1;
      e.preventDefault();
    }
  };

  return (
    <NumberFormatBase
      getInputRef={ref}
      name={name}
      value={value}
      onValueChange={(values) => {
        if (onChange) {
          onChange(values.formattedValue);
        }
      }}
      format={format}
      onKeyDown={onKeyDown}
      customInput={Input}
      placeholder={placeholder}
      className={cn('h-12 px-4 text-base', error ? 'border-[var(--danger)]' : '', className)}
      editor-id={editorId}
      disabled={disabled}
    />
  );
}

export default ExpiryInput;
