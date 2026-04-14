import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { LoginFormData } from 'types/user';
import { loginSchema } from 'schemas/auth/login.schema';
import { Input } from 'components/atoms/Input';
import { Button } from 'components/atoms/Button';
import { InputPassword } from 'components/molecules/InputPassword';

type LoginFormInputs = LoginFormData;

export const LoginForm: React.FC<{ onSubmit: (data: LoginFormInputs) => void }> = ({ onSubmit }) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormInputs>({
    resolver: zodResolver(loginSchema),
  });

  return (
    <>
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          id="email"
          type="email"
          label="Email"
          error={errors.email?.message}
          {...register('email')}
        />
        <InputPassword
          label="Password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" className="w-full" disabled={isSubmitting}>
          {isSubmitting ? 'Loading...' : 'Login'}
        </Button>
      </form>
      <p className="mt-4 text-sm text-center text-gray-500">
        Don&apos;t have an account?{' '}
        <Link to="/register" className="text-blue-600 hover:underline font-medium">
          Register
        </Link>
      </p>
    </>
  );
};
