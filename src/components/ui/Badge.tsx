import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

const badgeVariants = cva(
  'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2',
  {
    variants: {
      variant: {
        default:
          'border-transparent bg-[#3B1F0A] text-white hover:bg-[#3B1F0A]/80',
        secondary:
          'border-transparent bg-[#F5E6CC] text-[#3B1F0A] hover:bg-[#F5E6CC]/80',
        destructive:
          'border-transparent bg-red-100 text-red-800 hover:bg-red-200',
        success:
          'border-transparent bg-green-100 text-green-800 hover:bg-green-200',
        outline:
          'text-[#3B1F0A] border-[#E5D5C0]',
        gold:
          'border-transparent bg-[#E8A535] text-[#3B1F0A] hover:bg-[#E8A535]/80',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
