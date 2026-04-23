import { Control, FieldValues, Path, useController } from 'react-hook-form';
import { Checkbox as UICheckbox } from './ui/checkbox';

interface CheckboxProps<T extends FieldValues> {
  name: Path<T>;
  control: Control<T>;
  disabled?: boolean;
  className?: string;
  id?: string;
}

function Checkbox<T extends FieldValues>({ name, control, disabled, className, id }: CheckboxProps<T>) {
  const {
    field: { onChange, value, ...fieldProps },
  } = useController({ name, control });

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>) => {
    if (event.key === 'Enter' && !disabled) {
      event.preventDefault();
      onChange(!value);
    }
  };

  return (
    <UICheckbox
      id={id}
      className={className}
      checked={!!value}
      value={value}
      onCheckedChange={onChange}
      onKeyDown={handleKeyDown}
      disabled={disabled}
      {...fieldProps}
    />
  );
}

export default Checkbox;
