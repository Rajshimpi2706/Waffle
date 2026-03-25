import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const buttonVariants = cva(
  // base
  'inline-flex items-center justify-center gap-2 font-medium rounded-xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none',
  {
    variants: {
      variant: {
        primary:
          'bg-[#C17839] text-white hover:bg-[#A8662D] focus-visible:ring-[#C17839] active:scale-[0.98] shadow-sm hover:shadow-md',
        secondary:
          'bg-[#FDF6EC] text-[#3B1F0A] border-2 border-[#E5D5C0] hover:bg-[#F5E6CC] hover:border-[#C17839] focus-visible:ring-[#C17839]',
        ghost:
          'text-[#3B1F0A] hover:bg-[#F5E6CC] focus-visible:ring-[#C17839]',
        danger:
          'bg-red-600 text-white hover:bg-red-700 focus-visible:ring-red-500 active:scale-[0.98]',
        gold:
          'bg-[#E8A535] text-[#3B1F0A] hover:bg-[#D9952A] focus-visible:ring-[#E8A535] font-semibold shadow-sm hover:shadow-md active:scale-[0.98]',
        outline:
          'border-2 border-[#C17839] text-[#C17839] hover:bg-[#C17839] hover:text-white focus-visible:ring-[#C17839] transition-colors',
      },
      size: {
        sm: 'h-9 px-4 text-sm',
        md: 'h-11 px-6 text-sm min-h-[44px]',
        lg: 'h-13 px-8 text-base min-h-[44px]',
        xl: 'h-14 px-10 text-base font-semibold min-h-[44px]',
        icon: 'h-10 w-10 text-sm min-h-[44px] min-w-[44px]',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, loading, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(buttonVariants({ variant, size }), className)}
        disabled={disabled || loading}
        aria-busy={loading}
        {...props}
      >
        {loading ? (
          <svg
            className="animate-spin h-4 w-4"
            viewBox="0 0 24 24"
            fill="none"
          >
            <circle
              className="opacity-25"
              cx="12" cy="12" r="10"
              stroke="currentColor" strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
            />
          </svg>
        ) : (
          leftIcon
        )}
        {children}
        {!loading && rightIcon}
      </button>
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
