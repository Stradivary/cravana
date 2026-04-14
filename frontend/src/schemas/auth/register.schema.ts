import * as z from 'zod/v3';

export const registerSchema = z
  .object({
    name: z.string().min(2, { message: 'Nama wajib diisi' }),
    gender: z.enum(['P', 'L']),
    address: z.string().min(5, { message: 'Alamat wajib diisi' }),
    phoneNumber: z.string().min(8, { message: 'Nomor HP wajib diisi' }),
    email: z.string().email({ message: 'Email tidak valid' }),
    password: z.string().min(6, { message: 'Password minimal 6 karakter' }),
    confirmPassword: z.string().min(6, { message: 'Konfirmasi password minimal 6 karakter' }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Password dan konfirmasi harus sama',
    path: ['confirmPassword'],
  });
