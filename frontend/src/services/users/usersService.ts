import axios from 'axios';
import type { UserDetail, UserListItem } from 'types/dashboard';

const API_URL = process.env.REACT_APP_API_URL || 'https://cravana.vercel.app';

const toErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || error.message;
  }

  return 'Terjadi kesalahan pada server';
};

export const usersService = {
  getUsers: async (): Promise<UserListItem[]> => {
    try {
      const res = await axios.get(`${API_URL}/api/users`, { withCredentials: true });
      return res.data.users;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  getUserById: async (id: string): Promise<UserDetail> => {
    try {
      const res = await axios.get(`${API_URL}/api/users/${id}`, { withCredentials: true });
      return res.data.user;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  approveUser: async (id: string): Promise<UserListItem> => {
    try {
      const res = await axios.patch(
        `${API_URL}/api/users/${id}/approve`,
        {},
        { withCredentials: true }
      );

      return res.data.user;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  deleteUser: async (id: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/api/users/${id}`, { withCredentials: true });
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },
};
