import * as React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={
      'rounded-lg border bg-white p-4 shadow ' +
      (className ? ` ${className}` : '')
    }
    {...props}
  />
));
Card.displayName = 'Card';
