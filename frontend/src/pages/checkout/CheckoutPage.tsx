import React, { useCallback, useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeft, CheckCircle, Clock, QrCode, ShoppingBag, XCircle } from 'lucide-react';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from 'components/atoms/Button';
import { Input } from 'components/atoms/Input';
import { useCart } from 'hooks/useCart';
import { useAuthProfile } from 'hooks/useAuth';
import { checkoutService } from 'services/checkout/checkoutService';
import { isAuthenticatedSession } from 'lib/auth-session';
import type { CheckoutOrder, OrderStatus } from 'types/checkout';

// ── Validation ───────────────────────────────────────────────────────
const checkoutSchema = z.object({
  buyerName: z.string().min(1, 'Nama wajib diisi'),
  buyerPhone: z.string().min(6, 'No HP tidak valid'),
  buyerAddress: z.string().min(5, 'Alamat wajib diisi'),
});
type CheckoutFormData = z.infer<typeof checkoutSchema>;

// ── Helpers ──────────────────────────────────────────────────────────
const formatRupiah = (val: number) => `Rp${val.toLocaleString('id-ID')}`;

const formatCountdown = (seconds: number) => {
  const m = Math.floor(seconds / 60).toString().padStart(2, '0');
  const s = (seconds % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

// ── Component ────────────────────────────────────────────────────────
const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { data: cartData, isLoading: isLoadingCart } = useCart();
  const { data: profileData } = useAuthProfile();

  const selectedItemIds = (searchParams.get('items') ?? '')
    .split(',')
    .map((id) => id.trim())
    .filter(Boolean);

  const [order, setOrder] = useState<CheckoutOrder | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [createError, setCreateError] = useState('');
  const [orderStatus, setOrderStatus] = useState<OrderStatus>('pending');
  const [paidAt, setPaidAt] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<CheckoutFormData>({ resolver: zodResolver(checkoutSchema) });

  // Guard: redirect jika tidak login
  useEffect(() => {
    if (!isAuthenticatedSession()) navigate('/login', { replace: true });
  }, [navigate]);

  const allCartItems = cartData?.items ?? [];
  const cartItems = selectedItemIds.length > 0
    ? allCartItems.filter((item) => selectedItemIds.includes(item.id))
    : allCartItems;
  const cartTotal = cartItems.reduce((sum, item) => sum + item.subtotal, 0);

  // Guard: redirect jika cart kosong / pilihan item kosong (setelah loading)
  useEffect(() => {
    if (!isLoadingCart && cartItems.length === 0 && !order) {
      navigate('/home', { replace: true });
    }
  }, [isLoadingCart, cartItems.length, order, navigate]);

  // Pre-fill dari profile
  useEffect(() => {
    const p = profileData?.profile;
    if (!p) return;
    if (p.name) setValue('buyerName', p.name);
    if (p.phoneNumber) setValue('buyerPhone', p.phoneNumber);
    if (p.address) setValue('buyerAddress', p.address);
  }, [profileData, setValue]);

  // Timer countdown QR
  useEffect(() => {
    if (!order?.expiresAt || orderStatus !== 'pending') return;
    const calc = () =>
      Math.max(0, Math.floor((new Date(order.expiresAt!).getTime() - Date.now()) / 1000));
    setTimeLeft(calc());
    const id = setInterval(() => setTimeLeft(calc()), 1000);
    return () => clearInterval(id);
  }, [order?.expiresAt, orderStatus]);

  // Polling status setiap 5 detik
  const pollStatus = useCallback(
    async (orderId: string) => {
      try {
        const result = await checkoutService.getOrderStatus(orderId);
        if (result.status !== 'pending') {
          setOrderStatus(result.status);
          if (result.paidAt) setPaidAt(result.paidAt);
        }
      } catch {
        // abaikan error polling
      }
    },
    []
  );

  useEffect(() => {
    if (!order || orderStatus !== 'pending') return;
    const id = setInterval(() => void pollStatus(order.orderId), 5000);
    return () => clearInterval(id);
  }, [order, orderStatus, pollStatus]);

  const onSubmit = async (formData: CheckoutFormData) => {
    setCreateError('');
    setIsCreating(true);
    try {
      const result = await checkoutService.createCheckout({
        ...formData,
        cartItemIds: cartItems.map((item) => item.id),
      });
      setOrder(result.order);
      setOrderStatus(result.order.status);
    } catch (err) {
      setCreateError(err instanceof Error ? err.message : 'Gagal membuat pesanan');
    } finally {
      setIsCreating(false);
    }
  };

  // ──────────────────────────────────────────────────────────────────
  // SCREEN: Pembayaran (setelah order dibuat)
  // ──────────────────────────────────────────────────────────────────
  if (order) {
    return (
      <main className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="border-b bg-white">
          <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
            <button
              type="button"
              onClick={() => navigate('/home')}
              className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <p className="text-xs font-semibold tracking-wide text-amber-700">CRAVANA</p>
              <h1 className="text-lg font-bold text-gray-900">Status Pembayaran</h1>
            </div>
          </div>
        </div>

        <div className="mx-auto max-w-lg space-y-4 px-4 py-6">
          {/* Order ID */}
          <div className="rounded-xl border bg-white p-4">
            <p className="text-xs text-gray-500">ID Pesanan</p>
            <p className="mt-0.5 break-all font-mono text-sm font-semibold text-gray-800">
              #{order.orderId}
            </p>
          </div>

          {/* Status: Berhasil */}
          {orderStatus === 'paid' ? (
            <div className="flex items-center gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4">
              <CheckCircle size={36} className="flex-shrink-0 text-emerald-600" />
              <div>
                <p className="font-bold text-emerald-700">Pembayaran Berhasil!</p>
                {paidAt ? (
                  <p className="text-xs text-emerald-600">{new Date(paidAt).toLocaleString('id-ID')}</p>
                ) : null}
                <p className="mt-1 text-sm font-semibold text-emerald-700">{formatRupiah(order.totalAmount)}</p>
              </div>
            </div>
          ) : orderStatus === 'expired' ? (
            /* Status: Kadaluarsa */
            <div className="flex items-center gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
              <XCircle size={36} className="flex-shrink-0 text-red-500" />
              <div>
                <p className="font-bold text-red-700">QR QRIS Kadaluarsa</p>
                <p className="text-sm text-red-600">Silakan lakukan pesanan ulang.</p>
              </div>
            </div>
          ) : (
            /* Status: Pending – tampilkan QR */
            <div className="rounded-xl border bg-white p-5 text-center">
              <div className="mb-3 flex items-center justify-center gap-2 text-sm font-semibold text-gray-700">
                <QrCode size={18} className="text-amber-600" />
                Bayar via QRIS
              </div>

              {order.qrString ? (
                <div className="mx-auto w-fit rounded-lg border p-1">
                  <QRCodeSVG
                    value={order.qrString}
                    size={240}
                    level="M"
                    includeMargin
                    bgColor="#FFFFFF"
                    fgColor="#111827"
                  />
                </div>
              ) : (
                <div className="mx-auto flex h-[240px] w-[240px] items-center justify-center rounded-lg border bg-gray-50 text-sm text-gray-400">
                  QR tidak tersedia
                </div>
              )}

              <p className="mt-3 text-xs text-gray-500">
                Scan QR di atas menggunakan m-Banking, GoPay, OVO, Dana, atau e-wallet lainnya.
              </p>

              {timeLeft !== null ? (
                timeLeft > 0 ? (
                  <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1.5 text-sm font-semibold text-amber-700">
                    <Clock size={14} />
                    Bayar dalam {formatCountdown(timeLeft)}
                  </div>
                ) : (
                  <p className="mt-3 text-sm font-semibold text-red-600">Waktu pembayaran habis</p>
                )
              ) : null}

              <div className="mt-3 flex items-center justify-center gap-1.5 text-xs text-gray-400">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-400" />
                Menunggu konfirmasi pembayaran…
              </div>
            </div>
          )}

          {/* Ringkasan item */}
          <div className="rounded-xl border bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">Ringkasan Pesanan</p>
            <ul className="space-y-2">
              {order.items.map((item, i) => (
                <li
                  key={i}
                  className="flex items-center justify-between text-sm text-gray-700"
                >
                  <span className="truncate pr-2">
                    {item.productName}{' '}
                    <span className="text-gray-400">×{item.quantity}</span>
                  </span>
                  <span className="whitespace-nowrap font-semibold">{formatRupiah(item.subtotal)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-3 flex justify-between border-t pt-3 font-bold text-gray-900">
              <span>Total</span>
              <span>{formatRupiah(order.totalAmount)}</span>
            </div>
          </div>

          {/* Info pembeli */}
          <div className="rounded-xl border bg-white p-4 text-sm text-gray-700">
            <p className="mb-2 font-semibold text-gray-700">Info Pengiriman</p>
            <p>
              <span className="text-gray-500">Nama: </span>
              {order.buyerName}
            </p>
            <p>
              <span className="text-gray-500">No HP: </span>
              {order.buyerPhone}
            </p>
            <p>
              <span className="text-gray-500">Alamat: </span>
              {order.buyerAddress}
            </p>
          </div>

          <Button
            type="button"
            variant="secondary"
            className="w-full"
            onClick={() => navigate('/home')}
          >
            Kembali ke Menu
          </Button>
        </div>
      </main>
    );
  }

  // ──────────────────────────────────────────────────────────────────
  // SCREEN: Form Checkout
  // ──────────────────────────────────────────────────────────────────
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white">
        <div className="mx-auto flex max-w-lg items-center gap-3 px-4 py-4">
          <button
            type="button"
            onClick={() => navigate('/home')}
            className="rounded-full p-1.5 text-gray-500 hover:bg-gray-100"
          >
            <ArrowLeft size={20} />
          </button>
          <div>
            <p className="text-xs font-semibold tracking-wide text-amber-700">CRAVANA</p>
            <h1 className="text-lg font-bold text-gray-900">Checkout</h1>
          </div>
        </div>
      </div>

      {/* eslint-disable-next-line @typescript-eslint/no-misused-promises */}
      <form onSubmit={handleSubmit((d) => void onSubmit(d))}>
        <div className="mx-auto max-w-lg space-y-4 px-4 py-6">

          {/* Cart summary */}
          <div className="rounded-xl border bg-white p-4">
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold text-gray-700">
              <ShoppingBag size={16} className="text-amber-600" />
              Pesanan ({cartItems.length} item)
            </div>

            {isLoadingCart ? (
              <p className="text-sm text-gray-500">Memuat keranjang…</p>
            ) : (
              <ul className="space-y-3">
                {cartItems.map((item) => (
                  <li key={item.id} className="flex items-center gap-3">
                    {item.product?.imageUrl ? (
                      <img
                        src={item.product.imageUrl}
                        alt={item.product.name}
                        className="h-14 w-14 flex-shrink-0 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="h-14 w-14 flex-shrink-0 rounded-lg bg-gray-100" />
                    )}
                    <div className="flex flex-1 items-start justify-between">
                      <div>
                        <p className="text-sm font-semibold text-gray-900 leading-tight">
                          {item.product?.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {formatRupiah(item.priceSnapshot)} × {item.quantity}
                        </p>
                      </div>
                      <p className="text-sm font-bold text-amber-700">{formatRupiah(item.subtotal)}</p>
                    </div>
                  </li>
                ))}
              </ul>
            )}

            <div className="mt-4 flex justify-between border-t pt-3 text-sm font-bold text-gray-900">
              <span>Total</span>
              <span className="text-base">{formatRupiah(cartTotal)}</span>
            </div>
          </div>

          {/* Buyer info */}
          <div className="space-y-4 rounded-xl border bg-white p-4">
            <p className="text-sm font-semibold text-gray-700">Info Pengiriman</p>

            <Input
              label="Nama Penerima"
              placeholder="Nama lengkap"
              error={errors.buyerName?.message}
              {...register('buyerName')}
            />
            <Input
              label="Nomor HP"
              placeholder="08xxxxxxxxxx"
              type="tel"
              error={errors.buyerPhone?.message}
              {...register('buyerPhone')}
            />
            <div>
              <label className="mb-1 block text-sm font-medium">Alamat</label>
              <textarea
                placeholder="Jl. Contoh No. 1, Kota, Provinsi"
                rows={3}
                className={
                  'w-full resize-none rounded border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ' +
                  (errors.buyerAddress ? 'border-red-500' : 'border-gray-300')
                }
                {...register('buyerAddress')}
              />
              {errors.buyerAddress ? (
                <span className="text-xs text-red-500">{errors.buyerAddress.message}</span>
              ) : null}
            </div>
          </div>

          {/* Payment method */}
          <div className="rounded-xl border bg-white p-4">
            <p className="mb-3 text-sm font-semibold text-gray-700">Metode Pembayaran</p>
            <label className="flex cursor-pointer items-center gap-3 rounded-lg border-2 border-amber-400 bg-amber-50 p-3">
              <input
                type="radio"
                name="payment"
                value="qris"
                defaultChecked
                readOnly
                className="accent-amber-500"
              />
              <div className="flex items-center gap-2">
                <QrCode size={22} className="text-amber-600" />
                <div>
                  <p className="text-sm font-semibold text-gray-800">QRIS</p>
                  <p className="text-xs text-gray-500">
                    m-Banking, GoPay, OVO, Dana, dan e-wallet lainnya
                  </p>
                </div>
              </div>
              <span className="ml-auto whitespace-nowrap rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-700">
                Aktif
              </span>
            </label>
          </div>

          {createError ? (
            <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {createError}
            </div>
          ) : null}

          <Button
            type="submit"
            disabled={isCreating || isLoadingCart}
            className="w-full bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-60"
          >
            {isCreating ? 'Membuat Pesanan…' : `Buat Pesanan · ${formatRupiah(cartTotal)}`}
          </Button>
        </div>
      </form>
    </main>
  );
};

export default CheckoutPage;
