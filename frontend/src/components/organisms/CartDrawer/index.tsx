import React, { useEffect, useMemo, useState } from 'react';
import { X, Trash2, ShoppingCart, Plus, Minus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'components/atoms/Button';
import type { CartItem } from 'types/cart';
import { useRemoveCartItem, useUpdateCartItem, useClearCart } from 'hooks/useCart';

const formatRupiah = (value: number) => `Rp${value.toLocaleString('id-ID')}`;

type CartDrawerProps = {
  isOpen: boolean;
  onClose: () => void;
  items: CartItem[];
  total: number;
  isLoading: boolean;
  error?: string | null;
};

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  items,
  total,
  isLoading,
  error,
}) => {
  const navigate = useNavigate();
  const { mutate: removeItem, isPending: isRemoving } = useRemoveCartItem();
  const { mutate: updateItem, isPending: isUpdating } = useUpdateCartItem();
  const { mutate: clearCart, isPending: isClearing } = useClearCart();
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  const isBusy = isRemoving || isUpdating || isClearing;
  const allItemIds = useMemo(() => items.map((item) => item.id), [items]);
  const [hasInitializedForOpen, setHasInitializedForOpen] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setHasInitializedForOpen(false);
      return;
    }

    if (!hasInitializedForOpen) {
      setSelectedItemIds(allItemIds);
      setHasInitializedForOpen(true);
    }
  }, [isOpen, hasInitializedForOpen, allItemIds]);

  useEffect(() => {
    if (!isOpen) return;
    const idSet = new Set(allItemIds);
    setSelectedItemIds((prev) => prev.filter((id) => idSet.has(id)));
  }, [isOpen, allItemIds]);

  const isAllSelected = items.length > 0 && selectedItemIds.length === items.length;
  const selectedTotal = items
    .filter((item) => selectedItemIds.includes(item.id))
    .reduce((sum, item) => sum + item.subtotal, 0);
  const selectedQuantity = items
    .filter((item) => selectedItemIds.includes(item.id))
    .reduce((sum, item) => sum + item.quantity, 0);

  const handleToggleItem = (itemId: string) => {
    setSelectedItemIds((prev) => (
      prev.includes(itemId) ? prev.filter((id) => id !== itemId) : [...prev, itemId]
    ));
  };

  const handleToggleAll = () => {
    setSelectedItemIds((prev) => (prev.length === items.length ? [] : allItemIds));
  };

  return (
    <>
      {/* Overlay */}
      {isOpen ? (
        <div
          className="fixed inset-0 z-40 bg-black/40 transition-opacity"
          onClick={onClose}
          aria-hidden="true"
        />
      ) : null}

      {/* Drawer panel */}
      <div
        className={
          'fixed right-0 top-0 z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ' +
          (isOpen ? 'translate-x-0' : 'translate-x-full')
        }
        role="dialog"
        aria-modal="true"
        aria-label="Keranjang Belanja"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div className="flex items-center gap-2">
            <ShoppingCart size={20} className="text-amber-700" />
            <h2 className="text-lg font-bold text-gray-900">Keranjang</h2>
            {items.length > 0 ? (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                {items.length} item
              </span>
            ) : null}
          </div>
          <div className="flex items-center gap-2">
            {items.length > 0 ? (
              <button
                type="button"
                onClick={() => clearCart()}
                disabled={isBusy}
                className="flex items-center gap-1 rounded px-2 py-1 text-xs text-red-500 hover:bg-red-50 disabled:opacity-50"
              >
                <Trash2 size={13} />
                Kosongkan
              </button>
            ) : null}
            <button
              type="button"
              onClick={onClose}
              className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
              aria-label="Tutup keranjang"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-5 py-4">
          {isLoading ? (
            <div className="flex h-40 items-center justify-center text-sm text-gray-500">
              Memuat keranjang...
            </div>
          ) : error ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          ) : items.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-3 py-16 text-center text-gray-500">
              <ShoppingCart size={48} className="text-gray-200" />
              <p className="text-sm">Keranjang kamu masih kosong.</p>
              <p className="text-xs text-gray-400">Tambahkan produk dari halaman menu.</p>
            </div>
          ) : (
            <>
              <label className="mb-3 flex cursor-pointer items-center gap-2 rounded-lg bg-gray-50 px-3 py-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={isAllSelected}
                  onChange={handleToggleAll}
                  className="h-4 w-4 accent-amber-600"
                />
                Pilih semua item
              </label>

              <ul className="space-y-4">
              {items.map((item) => (
                <li key={item.id} className="flex gap-3 rounded-xl border p-3">
                  <div className="pt-1">
                    <input
                      type="checkbox"
                      checked={selectedItemIds.includes(item.id)}
                      onChange={() => handleToggleItem(item.id)}
                      className="h-4 w-4 accent-amber-600"
                      aria-label={`Pilih ${item.product?.name ?? 'produk'}`}
                    />
                  </div>
                  {/* Product image */}
                  {item.product?.imageUrl ? (
                    <img
                      src={item.product.imageUrl}
                      alt={item.product.name ?? 'Produk'}
                      className="h-20 w-20 flex-shrink-0 rounded-lg object-cover"
                    />
                  ) : (
                    <div className="h-20 w-20 flex-shrink-0 rounded-lg bg-gray-100" />
                  )}

                  {/* Info */}
                  <div className="flex flex-1 flex-col justify-between">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-semibold text-gray-900 leading-tight">
                        {item.product?.name ?? 'Produk'}
                      </p>
                      <button
                        type="button"
                        onClick={() => removeItem(item.id)}
                        disabled={isBusy}
                        className="flex-shrink-0 rounded p-0.5 text-gray-400 hover:text-red-500 disabled:opacity-50"
                        aria-label="Hapus dari keranjang"
                      >
                        <X size={14} />
                      </button>
                    </div>

                    <p className="mt-0.5 text-xs text-gray-500">
                      {formatRupiah(item.priceSnapshot)} / pcs
                    </p>

                    <div className="mt-2 flex items-center justify-between">
                      {/* Quantity stepper */}
                      <div className="flex items-center gap-2 rounded-lg border px-1 py-0.5">
                        <button
                          type="button"
                          disabled={isBusy || item.quantity <= 1}
                          onClick={() => updateItem({ itemId: item.id, quantity: item.quantity - 1 })}
                          className="flex h-6 w-6 items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                          aria-label="Kurangi qty"
                        >
                          <Minus size={12} />
                        </button>
                        <span className="min-w-[20px] text-center text-sm font-semibold text-gray-800">
                          {item.quantity}
                        </span>
                        <button
                          type="button"
                          disabled={isBusy || item.quantity >= (item.product?.stock ?? 1)}
                          onClick={() => updateItem({ itemId: item.id, quantity: item.quantity + 1 })}
                          className="flex h-6 w-6 items-center justify-center rounded text-gray-600 hover:bg-gray-100 disabled:opacity-30"
                          aria-label="Tambah qty"
                        >
                          <Plus size={12} />
                        </button>
                      </div>

                      {/* Subtotal */}
                      <p className="text-sm font-bold text-amber-700">
                        {formatRupiah(item.subtotal)}
                      </p>
                    </div>
                  </div>
                </li>
              ))}
              </ul>
            </>
          )}
        </div>

        {/* Footer */}
        {items.length > 0 ? (
          <div className="border-t bg-white px-5 py-4">
            <div className="mb-3 flex items-center justify-between text-sm text-gray-600">
              <span>Subtotal ({selectedQuantity} item dipilih)</span>
              <span className="text-base font-bold text-gray-900">{formatRupiah(selectedTotal)}</span>
            </div>
            <Button
              type="button"
              className="w-full bg-amber-600 text-white hover:bg-amber-700"
              disabled={selectedItemIds.length === 0}
              onClick={() => {
                onClose();
                navigate(`/checkout?items=${encodeURIComponent(selectedItemIds.join(','))}`);
              }}
            >
              {selectedItemIds.length === 0 ? 'Pilih item dulu' : 'Lanjut ke Checkout'}
            </Button>
          </div>
        ) : null}
      </div>
    </>
  );
};
