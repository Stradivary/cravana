import axios from 'axios';
import type { ProductItem } from 'types/product';

const API_URL = process.env.REACT_APP_API_URL || 'https://cravana.vercel.app';

const toErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || error.message;
  }

  return 'Terjadi kesalahan pada server';
};

export const productsService = {
  getProducts: async (): Promise<ProductItem[]> => {
    try {
      const res = await axios.get(`${API_URL}/api/products`, { withCredentials: true });
      return res.data.products as ProductItem[];
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },
};
