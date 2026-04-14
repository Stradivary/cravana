import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { cartService } from 'services/cart/cartService';
import { isAuthenticatedSession } from 'lib/auth-session';

export const CART_QUERY_KEY = ['cart'];

export const useCart = () => {
  return useQuery({
    queryKey: CART_QUERY_KEY,
    queryFn: cartService.getCart,
    enabled: isAuthenticatedSession(),
    retry: false,
  });
};

export const useAddToCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartService.addToCart,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useUpdateCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartService.updateCartItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useRemoveCartItem = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartService.removeCartItem,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};

export const useClearCart = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: cartService.clearCart,
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: CART_QUERY_KEY });
    },
  });
};
