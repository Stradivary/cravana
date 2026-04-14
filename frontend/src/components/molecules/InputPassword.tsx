
import React, { useState } from 'react';
import { Input } from 'components/atoms/Input';
import { Eye, EyeOff } from 'lucide-react';

export interface InputPasswordProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}


export const InputPassword: React.FC<InputPasswordProps> = ({ label, error, className, ...props }) => {
  const [show, setShow] = useState(false);
  return (
    <div className="space-y-1">
      {label && <label className="block text-sm font-medium mb-1">{label}</label>}
      <div className="relative">
        <Input
          type={show ? 'text' : 'password'}
          error={error}
          {...props}
          className={`w-full pr-10 ${className ? className : ''}`}
        />
        <button
          type="button"
          onClick={() => setShow((v) => !v)}
          className="absolute right-2 top-1/2 -translate-y-1/2 inline-flex h-8 w-8 items-center justify-center rounded text-gray-500 hover:bg-gray-100 hover:text-gray-700 focus:outline-none"
          aria-label={show ? 'Sembunyikan password' : 'Tampilkan password'}
          aria-pressed={show}
        >
          {show ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </div>
    </div>
  );
};
