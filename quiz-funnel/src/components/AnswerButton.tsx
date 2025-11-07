import { cn } from "@/lib/utils";
import { PluginConfig } from "@/types/plugin-config";
import { usePluginConfig } from "@tagadapay/plugin-sdk/v2";

interface AnswerButtonProps {
  id: string;
  label: string;
  description?: string;
  image?: string;
  isSelected: boolean;
  onClick: () => void;
  variant?: "default" | "image";
  className?: string;
}

export const AnswerButton = ({
  id,
  label,
  description,
  image,
  isSelected,
  onClick,
  variant = "default",
  className,
}: AnswerButtonProps) => {
  const { config } = usePluginConfig<PluginConfig>();
  const baseClasses = "transition-all duration-300 border-2";

  const variantClasses = {
    default: "py-2.5 px-5 rounded-lg text-left",
    image: "group relative overflow-hidden rounded-lg",
  };

  const stateClasses = isSelected
    ? "shadow-lg"
    : "border-border hover:bg-[color:var(--hover-bg-color)] focus:bg-[color:var(--focus-bg-color)] focus:ring-[color:var(--focus-ring-color)] focus:ring-2 focus:outline-none";

  const imageStateClasses = isSelected
    ? "shadow-lg scale-105"
    : "border-border hover:scale-102";

  if (variant === "image") {
    return (
      <button
        onClick={onClick}
        className={cn(
          baseClasses,
          variantClasses.image,
          imageStateClasses,
          className
        )}
        style={
          isSelected
            ? {
                borderColor: config.primaryColor,
                backgroundColor: `${config.primaryColor}05`,
              }
            : {}
        }
      >
        <div className="aspect-square">
          <img
            src={image || "/placeholder.svg"}
            alt={label}
            className="w-full h-full object-cover"
          />
        </div>
        <div
          className={cn(
            "absolute bottom-0 left-0 right-0 bg-white/50 backdrop-blur-sm p-3 transition-colors",
            isSelected && "text-white"
          )}
          style={
            isSelected ? { backgroundColor: `${config.primaryColor}90` } : {}
          }
        >
          <span className="font-medium">{label}</span>
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      className={cn(
        baseClasses,
        variantClasses[variant],
        stateClasses,
        className
      )}
      style={
        isSelected
          ? {
              borderColor: config.primaryColor,
              backgroundColor: `${config.primaryColor}05`,
            }
          : ({
              "--hover-bg-color": `${config.primaryColor}10`, // 10% opacity
              "--focus-bg-color": `${config.primaryColor}10`, // 10% opacity
              "--focus-ring-color": `${config.primaryColor}80`, // 50% opacity (80 in hex = 50%)
            } as React.CSSProperties)
      }
    >
      <div className="font-semibold text-lg mb-2">{label}</div>
      {description && (
        <div className="text-muted-foreground">{description}</div>
      )}
    </button>
  );
};
