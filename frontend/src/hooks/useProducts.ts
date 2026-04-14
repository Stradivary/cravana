import { useQuery } from '@tanstack/react-query';
import { productsService } from 'services/products/productsService';

export const PRODUCTS_QUERY_KEY = ['products'];

export const useProducts = () => {
  return useQuery({
    queryKey: PRODUCTS_QUERY_KEY,
    queryFn: productsService.getProducts,
  });
};
