import axios from 'axios';
import type {
  CreateCheckoutPayload,
  CreateCheckoutResponse,
  OrderStatusResponse,
} from 'types/checkout';

const API_URL = process.env.REACT_APP_API_URL || 'https://cravana.vercel.app';

const toErrorMessage = (error: unknown) => {
  if (axios.isAxiosError<{ error?: string }>(error)) {
    return error.response?.data?.error || error.message;
  }
  return 'Terjadi kesalahan pada server';
};

export const checkoutService = {
  createCheckout: async (payload: CreateCheckoutPayload): Promise<CreateCheckoutResponse> => {
    try {
      const res = await axios.post(`${API_URL}/api/checkout`, payload, { withCredentials: true });
      return res.data as CreateCheckoutResponse;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },

  getOrderStatus: async (orderId: string): Promise<OrderStatusResponse> => {
    try {
      const res = await axios.get(`${API_URL}/api/checkout/${orderId}`, { withCredentials: true });
      return res.data as OrderStatusResponse;
    } catch (error) {
      throw new Error(toErrorMessage(error));
    }
  },
};
