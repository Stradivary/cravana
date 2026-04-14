export interface CartProduct {
  id: string;
  slug: string;
  name: string;
  summary: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  stock: number;
}

export interface CartItem {
  id: string;
  productId: string;
  quantity: number;
  priceSnapshot: number;
  subtotal: number;
  createdAt: string;
  updatedAt: string;
  product: CartProduct | null;
}

export interface CartResponse {
  items: CartItem[];
  total: number;
}
