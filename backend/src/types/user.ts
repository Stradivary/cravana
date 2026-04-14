export type JenisKelamin = 'P' | 'L';

export interface RegisterFormData {
  nama: string;
  jenisKelamin: JenisKelamin;
  alamat: string;
  noHp: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface LoginFormData {
  email: string;
  password: string;
}
