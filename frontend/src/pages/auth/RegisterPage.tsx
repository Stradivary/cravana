import React from 'react';
import { User } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { RegisterForm } from 'components/organisms/RegisterForm';
import { useRegister } from 'hooks/useAuth';
import type { RegisterFormData } from 'types/user';

const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const { mutateAsync: register, isPending, isError, error } = useRegister();

  const handleSubmit = async (data: RegisterFormData) => {
    try {
      await register({
        name: data.name,
        gender: data.gender,
        address: data.address,
        email: data.email,
        phoneNumber: data.phoneNumber,
        password: data.password,
        fileUrl: null,
      });

      navigate('/login', { replace: true });
    } catch {
      return;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 bg-white rounded-2xl shadow-md">
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 inline-flex h-14 w-14 items-center justify-center rounded-full bg-blue-100 text-blue-600">
            <User size={28} />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Create Account</h1>
        </div>
        <RegisterForm
          onSubmit={handleSubmit}
          loading={isPending}
          errorMessage={isError ? (error as Error)?.message || 'Register gagal, silakan coba lagi.' : undefined}
        />
      </div>
    </div>
  );
};

export default RegisterPage;
