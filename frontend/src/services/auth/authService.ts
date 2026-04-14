import axios from 'axios';
import type { LoginFormData, RegisterPayload } from 'types/user';

const API_URL = process.env.REACT_APP_API_URL || 'https://cravana.vercel.app';

const toErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || error.message;
  }

  return 'Terjadi kesalahan pada server';
};

export const authService = {
  login: async ({ email, password }: LoginFormData) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/login`,
        {
          email,
          password,
        },
        {
          withCredentials: true,
        }
      );

      return res.data;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  register: async ({ name, gender, address, email, phoneNumber, password, fileUrl }: RegisterPayload) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/register`,
        {
          name,
          gender,
          address,
          email,
          phoneNumber,
          password,
          fileUrl,
        },
        {
          withCredentials: true,
        }
      );

      return res.data;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  loginWithGoogle: async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/google`, {
        withCredentials: true,
      });

      // backend mengembalikan { url } → map ke redirectUrl agar kompatibel dengan LoginPage
      return { redirectUrl: res.data.url } as { redirectUrl?: string };
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  verifyGoogleToken: async (accessToken: string) => {
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/google/verify`,
        { access_token: accessToken },
        { withCredentials: true }
      );

      return res.data as {
        message: string;
        user: { id: string; name: string; email: string; approved: boolean };
      };
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  getSession: async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/session`, {
        withCredentials: true,
      });

      return res.data as {
        isAuthenticated: boolean;
        userId?: string;
        email?: string;
        provider?: string;
      };
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  getProfile: async () => {
    try {
      const res = await axios.get(`${API_URL}/api/auth/profile`, {
        withCredentials: true,
      });

      return res.data as {
        profile: {
          id: string;
          name: string;
          role: string | null;
          email: string;
          gender: string | null;
          address: string | null;
          phoneNumber: string | null;
          fileUrl: string | null;
          approved: boolean;
          provider: string | null;
          createdAt: string | null;
        };
      };
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  logout: async () => {
    try {
      const res = await axios.post(
        `${API_URL}/api/auth/logout`,
        {},
        { withCredentials: true }
      );

      return res.data as { message: string };
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },
};
