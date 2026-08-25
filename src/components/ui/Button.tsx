'use client';

import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-lg text-sm font-medium transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1e3a2f] focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-[0.98] cursor-pointer',
  {
    variants: {
      variant: {
        default:
          'bg-[#1e3a2f] text-[#fcfbf9] hover:bg-[#284f40] shadow-sm hover:shadow',
        secondary:
          'bg-[#f3eee7] text-[#38342f] hover:bg-[#eae3d8] border border-[#e7e2d9]',
        outline:
          'border border-[#dcd6ca] bg-transparent hover:bg-[#f5efeb] text-[#21201c]',
        ghost:
          'hover:bg-[#f3eee7] text-[#38342f]',
        destructive:
          'bg-rose-700 text-white hover:bg-rose-800 shadow-sm',
        accent:
          'bg-[#2d5a47] text-white hover:bg-[#234738] shadow-sm',
        link: 'text-[#1e3a2f] underline-offset-4 hover:underline p-0 h-auto',
      },
      size: {
        default: 'h-10 px-4 py-2',
        sm: 'h-8 rounded-md px-3 text-xs',
        lg: 'h-11 rounded-lg px-6 text-base font-semibold',
        icon: 'h-9 w-9 rounded-lg',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, ...props }, ref) => {
    return (
      <button
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
