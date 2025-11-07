import { Check, ChevronsUpDown, Search } from "lucide-react";
import * as React from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/v2";

export interface ComboboxOption {
  value: string;
  label: string;
}

interface ComboboxProps {
  options: ComboboxOption[];
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  error?: boolean;
  className?: string;
}

export function Combobox({
  options,
  value,
  onValueChange,
  placeholder = "Select option...",
  error = false,
  className,
}: ComboboxProps) {
  const { config } = usePluginConfig<PluginConfig>();
  const [open, setOpen] = React.useState(false);
  const [searchValue, setSearchValue] = React.useState("");
  const comboboxRef = React.useRef<HTMLDivElement>(null);

  const selectedOption = options.find((option) => option.value === value);

  // Filter options based on search
  const filteredOptions = options.filter((option) =>
    option.label.toLowerCase().includes(searchValue.toLowerCase())
  );

  // Close combobox when clicking outside
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        comboboxRef.current &&
        !comboboxRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
        setSearchValue("");
      }
    };

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={comboboxRef}>
      <Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          "w-full justify-between h-12 border-input",
          error && "border-red-500 focus:border-red-500 focus:ring-red-100",
          className
        )}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(!open);
        }}
      >
        {selectedOption ? selectedOption.label : placeholder}
        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
      </Button>
      {open && (
        <div
          className="absolute z-50 mt-1 w-full rounded-md border border-input bg-white shadow-lg"
          onFocus={(e) => e.stopPropagation()}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="max-h-60 overflow-auto p-1">
            {/* Search input */}
            <div className="sticky top-0 bg-white p-2 border-b border-input">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search..."
                  value={searchValue}
                  onChange={(e) => setSearchValue(e.target.value)}
                  className="pl-10 h-8 text-sm"
                  onFocus={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
                />
              </div>
            </div>
            {filteredOptions.map((option) => (
              <button
                key={option.value}
                className={cn(
                  "relative flex w-full cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-[color:var(--hover-bg-color)] hover:text-[color:var(--hover-text-color)] data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
                  value === option.value &&
                    "bg-[color:var(--selected-bg-color)] text-[color:var(--selected-text-color)]"
                )}
                style={
                  {
                    "--hover-bg-color": `${config.primaryColor}10`, // 10% opacity
                    "--hover-text-color": config.primaryColor,
                    "--selected-bg-color": `${config.primaryColor}20`, // 20% opacity
                    "--selected-text-color": config.primaryColor,
                  } as React.CSSProperties
                }
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onValueChange(option.value);
                  setOpen(false);
                  setSearchValue(""); // Clear search when option is selected
                }}
              >
                <Check
                  className={cn(
                    "mr-2 h-4 w-4",
                    value === option.value ? "opacity-100" : "opacity-0"
                  )}
                />
                {option.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
