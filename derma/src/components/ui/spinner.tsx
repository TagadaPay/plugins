import { cn } from '../../lib/utils';
import { cva, type VariantProps } from 'class-variance-authority';

const spinnerVariants = cva(
    'animate-spin rounded-full',
    {
        variants: {
            variant: {
                default: 'border-2 border-gray-200 border-t-blue-600',
                thick: 'border-4 border-gray-200 border-t-blue-600',
                dots: 'border-0',
            },
            size: {
                sm: 'h-4 w-4',
                md: 'h-6 w-6',
                lg: 'h-8 w-8',
                xl: 'h-12 w-12',
            },
        },
        defaultVariants: {
            variant: 'default',
            size: 'md',
        },
    }
);

export interface SpinnerProps
    extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof spinnerVariants> {
    text?: string;
}

export function Spinner({
    className,
    variant,
    size,
    text = 'Loading...',
    ...props
}: SpinnerProps) {
    if (variant === 'dots') {
        return (
            <div className={cn('flex items-center justify-center rounded-full space-x-1', className)} {...props}>
                <div className="flex space-x-1">
                    <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.3s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-current [animation-delay:-0.15s]"></div>
                    <div className="h-2 w-2 animate-bounce rounded-full bg-current"></div>
                </div>
                {text && <span className="sr-only">{text}</span>}
            </div>
        );
    }

    return (
        <div
            className={cn(spinnerVariants({ variant, size }), className)}
            role="status"
            {...props}
        >
            <span className="sr-only">{text}</span>
        </div>
    );
}
// Convenience components for common use cases
export function SpinnerOverlay({
    isLoading,
    text = 'Loading...',
    className
}: {
    isLoading: boolean;
    text?: string;
    className?: string;
}) {
    if (!isLoading) return null;

    return (
        <div className={cn(
            'fixed inset-0 z-50 flex items-center justify-center bg-black/50 opacity-50',
            className
        )}>
            <div className="flex flex-col items-center space-y-4 rounded-lg bg-white p-6 shadow-lg">
                <Spinner size="lg" />
                <p className="text-sm text-gray-600">{text}</p>
            </div>
        </div>
    );
}

export function SpinnerInline({
    text = 'Loading...',
    className
}: {
    text?: string;
    className?: string;
}) {
    return (
        <div className={cn('flex items-center space-x-2', className)}>
            <Spinner size="sm" />
            <span className="text-sm text-gray-600">{text}</span>
        </div>
    );
} 