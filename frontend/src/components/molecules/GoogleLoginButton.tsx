import React from 'react';
import { Button } from 'components/atoms/Button';

type GoogleLoginButtonProps = {
  onClick: () => void;
  disabled?: boolean;
};

const GoogleIcon: React.FC = () => (
  <svg aria-hidden="true" className="h-5 w-5" viewBox="0 0 24 24">
    <path
      d="M21.35 11.1H12v2.92h5.38c-.23 1.5-1.7 4.4-5.38 4.4-3.24 0-5.88-2.68-5.88-5.99s2.64-5.99 5.88-5.99c1.85 0 3.09.79 3.8 1.47l2.6-2.51C16.75 3.87 14.57 3 12 3 6.94 3 2.84 7.03 2.84 12.01S6.94 21 12 21c6.92 0 9.35-4.86 9.35-7.37 0-.5-.04-.86-.1-1.23Z"
      fill="currentColor"
    />
  </svg>
);

export const GoogleLoginButton: React.FC<GoogleLoginButtonProps> = ({ onClick, disabled = false }) => {
  return (
    <Button
      className="inline-flex w-full items-center justify-center gap-2 bg-white text-gray-800 ring-1 ring-gray-300 hover:bg-gray-100"
      disabled={disabled}
      onClick={onClick}
      type="button"
      variant="secondary"
    >
      <GoogleIcon />
      <span>Masuk dengan Google</span>
    </Button>
  );
};
