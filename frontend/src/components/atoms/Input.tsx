import * as React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, ...props }, ref) => (
    <div className="w-full">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <input
        ref={ref}
        className={
          'border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full ' +
          (error ? 'border-red-500 ' : 'border-gray-300 ') +
          (className ? className : '')
        }
        {...props}
      />
      {error && <span className="text-red-500 text-xs">{error}</span>}
    </div>
  )
);
Input.displayName = 'Input';
