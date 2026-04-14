import { useMutation, useQuery } from '@tanstack/react-query';
import { authService } from '../services/auth/authService';

export const useLogin = () => {
  return useMutation({
    mutationFn: authService.login,
  });
};

export const useRegister = () => {
  return useMutation({
    mutationFn: authService.register,
  });
};

export const useGoogleLogin = () => {
  return useMutation({
    mutationFn: authService.loginWithGoogle,
  });
};

export const useAuthSession = () => {
  return useQuery({
    queryKey: ['auth-session'],
    queryFn: authService.getSession,
    enabled: false,
    retry: false,
  });
};

export const useAuthProfile = () => {
  return useQuery({
    queryKey: ['auth-profile'],
    queryFn: authService.getProfile,
    retry: false,
  });
};

export const useLogout = () => {
  return useMutation({
    mutationFn: authService.logout,
  });
};
