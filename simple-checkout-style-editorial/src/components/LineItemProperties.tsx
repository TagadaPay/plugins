import { getLineItemProperties } from '@/lib/utils';

interface LineItemPropertiesProps {
  item: any;
  className?: string;
}

export function LineItemProperties({ item, className }: LineItemPropertiesProps) {
  const props = getLineItemProperties(item);

  if (props.length === 0) return null;

  return (
    <div className={className || "mt-1 flex flex-wrap gap-1"}>
      {props.map(({ key, value }) => (
        <span
          key={key}
          className="inline-flex items-center rounded border border-[var(--border-color)] px-1.5 py-0.5 text-[10px] text-[var(--text-secondary-color)]"
        >
          <span className="font-medium">{key}:</span>
          <span className="ml-0.5">{value}</span>
        </span>
      ))}
    </div>
  );
}
