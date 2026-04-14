import React from 'react';
import { Card } from 'components/atoms/Card';
import { Button } from 'components/atoms/Button';
import { ShoppingCart } from 'lucide-react';

export type ProductCardItem = {
  id: string;
  name: string;
  summary: string;
  imageUrl: string;
  originalPriceLabel: string;
  discountedPriceLabel: string;
  points: number;
};

type ProductCardProps = {
  product: ProductCardItem;
  quantityInCart?: number;
  onAddToCart?: (productId: string) => void;
  onBuyNow?: (productId: string) => void;
  hideActions?: boolean;
};

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  quantityInCart = 0,
  onAddToCart,
  onBuyNow,
  hideActions = false,
}) => {
  return (
    <Card className="overflow-hidden p-0">
      <div className="group overflow-hidden">
        <img
          src={product.imageUrl}
          alt={product.name}
          className="h-52 w-full object-cover transition-transform duration-300 group-hover:scale-110"
        />
      </div>

      <div className="p-5">
        <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
        <p className="mt-2 text-sm text-gray-600">{product.summary}</p>

        <div className="mt-4 space-y-1">
          <p className="text-sm text-gray-500 line-through">{product.originalPriceLabel}</p>
          <p className="text-lg font-bold text-amber-700">{product.discountedPriceLabel}</p>
          <p className="text-sm text-gray-600">Point: <span className="font-semibold">{product.points}</span></p>
        </div>

        {!hideActions ? (
          <div className="mt-4 flex flex-col gap-2 sm:grid sm:grid-cols-2">
            <Button
              type="button"
              className="inline-flex items-center justify-center gap-2 whitespace-nowrap"
              onClick={() => onAddToCart?.(product.id)}
              variant="primary"
            >
              <span className="relative inline-flex">
                <ShoppingCart size={16} />
                {quantityInCart > 0 ? (
                  <span className="absolute -right-2 -top-2 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-semibold leading-none text-white">
                    {quantityInCart}
                  </span>
                ) : null}
              </span>
              <span>Add to Cart</span>
            </Button>
            <Button
              type="button"
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => onBuyNow?.(product.id)}
            >
              Beli Langsung
            </Button>
          </div>
        ) : null}
      </div>
    </Card>
  );
};
