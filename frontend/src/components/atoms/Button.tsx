import * as React from 'react';
import * as RadixButton from '@radix-ui/react-slot';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean;
  variant?: 'primary' | 'secondary';
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ asChild = false, variant = 'primary', className, ...props }, ref) => {
    const Comp = asChild ? RadixButton.Slot : 'button';
    return (
      <Comp
        ref={ref}
        className={
          `px-4 py-2 rounded font-medium transition-colors ` +
          (variant === 'primary' ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-gray-200 text-gray-900 hover:bg-gray-300') +
          (className ? ` ${className}` : '')
        }
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';
