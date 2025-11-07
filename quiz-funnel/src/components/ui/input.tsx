import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/v2";
import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<"input">>(
  ({ className, type, ...props }, ref) => {
    const { config } = usePluginConfig<PluginConfig>();

    return (
      <input
        type={type}
        data-slot="input"
        className={cn(
          "file:text-foreground placeholder:text-gray-500 dark:bg-input/30 border-input flex h-12 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:ring-[3px] focus-visible:ring-[color:var(--focus-ring-color)]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          className
        )}
        style={
          {
            "--selection-bg": config.primaryColor,
            "--selection-text": config.primaryForeground,
            "--focus-ring-color": `${config.primaryColor}80`, // 50% opacity (80 in hex = 50%)
          } as React.CSSProperties
        }
        ref={ref}
        {...props}
      />
    );
  }
);

Input.displayName = "Input";

export { Input };
