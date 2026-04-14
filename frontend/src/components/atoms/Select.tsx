import * as React from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: { value: string; label: string }[];
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ label, error, options, className, onFocus, onBlur, onClick, onChange, ...props }, ref) => {
    const [isOpen, setIsOpen] = React.useState(false);

    return (
      <div className="w-full">
        {label && <label className="block text-sm font-medium mb-1">{label}</label>}
        <div className="relative">
          <select
            ref={ref}
            className={
              'border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full appearance-none pr-10 ' +
              (error ? 'border-red-500 ' : 'border-gray-300 ') +
              (className ? className : '')
            }
            onFocus={(event) => {
              setIsOpen(true);
              onFocus?.(event);
            }}
            onBlur={(event) => {
              setIsOpen(false);
              onBlur?.(event);
            }}
            onChange={(event) => {
              setIsOpen(false);
              onChange?.(event);
            }}
            {...props}
          >
            <option value="">Pilih...</option>
            {options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-gray-500">
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </span>
        </div>
        {error && <span className="text-red-500 text-xs">{error}</span>}
      </div>
    );
  }
);
Select.displayName = 'Select';
