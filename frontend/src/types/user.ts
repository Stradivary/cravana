export type Gender = 'P' | 'L';

export interface RegisterFormData {
  name: string;
  gender: Gender;
  address: string;
  phoneNumber: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface RegisterPayload {
  name: string;
  gender: Gender;
  address: string;
  email: string;
  phoneNumber: string;
  password: string;
  fileUrl?: string | null;
}

export interface LoginFormData {
  email: string;
  password: string;
}
