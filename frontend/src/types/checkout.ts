export type OrderStatus = 'pending' | 'paid' | 'expired' | 'failed' | 'cancelled';

export interface CheckoutCartItem {
  productId: string;
  productName: string;
  imageUrl: string | null;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export interface CheckoutOrder {
  orderId: string;
  status: OrderStatus;
  totalAmount: number;
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  qrString: string | null;
  expiresAt: string | null;
  paidAt: string | null;
  createdAt: string;
  items: CheckoutCartItem[];
}

export interface CreateCheckoutPayload {
  buyerName: string;
  buyerPhone: string;
  buyerAddress: string;
  cartItemIds?: string[];
}

export interface CreateCheckoutResponse {
  order: CheckoutOrder;
}

export interface OrderStatusResponse {
  orderId: string;
  status: OrderStatus;
  totalAmount: number;
  paidAt: string | null;
}
