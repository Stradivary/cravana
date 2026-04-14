import axios from 'axios';
import type { CartResponse } from 'types/cart';

const API_URL = process.env.REACT_APP_API_URL || 'https://cravana.vercel.app';

const toErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || error.message;
  }
  return 'Terjadi kesalahan pada server';
};

export const cartService = {
  getCart: async (): Promise<CartResponse> => {
    try {
      const res = await axios.get(`${API_URL}/api/cart`, { withCredentials: true });
      return res.data as CartResponse;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  addToCart: async ({ productId, quantity = 1 }: { productId: string; quantity?: number }): Promise<void> => {
    try {
      await axios.post(`${API_URL}/api/cart`, { productId, quantity }, { withCredentials: true });
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  updateCartItem: async ({ itemId, quantity }: { itemId: string; quantity: number }): Promise<void> => {
    try {
      await axios.put(`${API_URL}/api/cart/${itemId}`, { quantity }, { withCredentials: true });
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  removeCartItem: async (itemId: string): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/api/cart/${itemId}`, { withCredentials: true });
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  clearCart: async (): Promise<void> => {
    try {
      await axios.delete(`${API_URL}/api/cart`, { withCredentials: true });
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },
};
