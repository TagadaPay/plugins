import { cn } from "@/lib/utils";
import * as React from "react";

interface ComboboxProps {
  options: { value: string; label: string }[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  error?: boolean;
}

export const Combobox: React.FC<ComboboxProps> = ({
  options,
  value,
  onValueChange,
  placeholder = "",
  className = "",
  error = false,
}) => {
  const [open, setOpen] = React.useState(false);
  const [search, setSearch] = React.useState("");
  const inputRef = React.useRef<HTMLInputElement>(null);

  const filtered = React.useMemo(() => {
    if (!search) return options;
    return options.filter((opt) =>
      opt.label.toLowerCase().includes(search.toLowerCase())
    );
  }, [search, options]);

  React.useEffect(() => {
    if (open && inputRef.current) {
      inputRef.current.focus();
    }
  }, [open]);

  const selectedLabel = options.find((opt) => opt.value === value)?.label || "";

  return (
    <div className={cn("relative", className)}>
      <button
        type="button"
        className={cn(
          "flex h-12 w-full items-center justify-between rounded-md border px-3 py-2 text-base bg-white",
          error ? "border-red-500" : "border-gray-400"
        )}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={cn(!selectedLabel && "text-gray-400")}>
          {selectedLabel || placeholder}
        </span>
        <svg
          className="ml-2 h-4 w-4 text-gray-500"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M19 9l-7 7-7-7"
          />
        </svg>
      </button>
      {open && (
        <div className="absolute z-10 mt-1 w-full rounded-md border border-gray-300 bg-white shadow-lg">
          <input
            ref={inputRef}
            type="text"
            className="w-full border-0 border-b border-gray-200 px-3 py-2 text-base focus:outline-none"
            placeholder="Type to search..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Escape") setOpen(false);
            }}
          />
          <ul
            tabIndex={-1}
            role="listbox"
            className="max-h-60 overflow-auto py-1"
          >
            {filtered.length === 0 && (
              <li className="px-3 py-2 text-gray-400">No results</li>
            )}
            {filtered.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className={cn(
                  "cursor-pointer px-3 py-2 hover:bg-gray-100",
                  opt.value === value && "bg-gray-100 font-semibold"
                )}
                onClick={() => {
                  onValueChange(opt.value);
                  setOpen(false);
                  setSearch("");
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
