export interface ProductItem {
  id: string;
  slug: string;
  name: string;
  summary: string;
  imageUrl: string;
  originalPrice: number;
  discountedPrice: number;
  points: number;
  stock: number;
  isActive: boolean;
  createdAt: string | null;
}
