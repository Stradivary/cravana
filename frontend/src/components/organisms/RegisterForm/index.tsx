import React from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import type { RegisterFormData } from 'types/user';
import { registerSchema } from 'schemas/auth/register.schema';
import { Input } from 'components/atoms/Input';
import { Button } from 'components/atoms/Button';
import { InputPassword } from 'components/molecules/InputPassword';
import { Select } from 'components/atoms/Select';

type RegisterFormInputs = RegisterFormData;

interface RegisterFormProps {
  onSubmit: (data: RegisterFormInputs) => Promise<void> | void;
  loading?: boolean;
  errorMessage?: string;
}

export const RegisterForm: React.FC<RegisterFormProps> = ({
  onSubmit,
  loading = false,
  errorMessage,
}) => {
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormInputs>({
    resolver: zodResolver(registerSchema),
  });

  return (
    <>
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      <Input
        id="name"
        type="text"
        label="Nama"
        error={errors.name?.message}
        {...register('name')}
      />
      <Select
        label="Jenis Kelamin"
        error={errors.gender?.message}
        options={[
          { value: 'P', label: 'P' },
          { value: 'L', label: 'L' },
        ]}
        {...register('gender')}
      />
      <Input
        id="address"
        type="text"
        label="Alamat"
        error={errors.address?.message}
        {...register('address')}
      />
      <Input
        id="phoneNumber"
        type="text"
        label="Nomor HP"
        error={errors.phoneNumber?.message}
        {...register('phoneNumber')}
      />
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
      <InputPassword
        label="Konfirmasi Password"
        error={errors.confirmPassword?.message}
        {...register('confirmPassword')}
      />
      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting || loading ? 'Loading...' : 'Register'}
      </Button>
      {errorMessage ? (
        <p className="text-center text-sm text-red-600">{errorMessage}</p>
      ) : null}
    </form>
    <p className="mt-4 text-sm text-center text-gray-500">
      Already have an account?{' '}
      <Link to="/login" className="text-blue-600 hover:underline font-medium">
        Sign In
      </Link>
    </p>
    </>
  );
};
