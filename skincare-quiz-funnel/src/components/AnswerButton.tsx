import { cn } from "@/lib/utils";

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
  const baseClasses = "transition-all duration-300 border-2";

  const variantClasses = {
    default: "py-2.5 px-5 rounded-lg text-left",
    image: "group relative overflow-hidden rounded-lg",
  };

  const stateClasses = isSelected
    ? "border-primary bg-primary/5 shadow-lg"
    : "border-border hover:border-primary/50 hover:bg-muted/50";

  const imageStateClasses = isSelected
    ? "border-primary shadow-lg scale-105"
    : "border-border hover:border-primary/50 hover:scale-102";

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
            isSelected && "bg-primary/90 text-white"
          )}
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
    >
      <div className="font-semibold text-lg mb-2">{label}</div>
      {description && (
        <div className="text-muted-foreground">{description}</div>
      )}
    </button>
  );
};
