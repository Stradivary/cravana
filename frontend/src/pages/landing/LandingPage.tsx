import React, { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from 'components/atoms/Button';
import { Card } from 'components/atoms/Card';
import { useGoogleLogin } from 'hooks/useAuth';
import { isAuthenticatedSession, setAuthenticatedSession } from 'lib/auth-session';
import { ProductCard, type ProductCardItem } from 'components/molecules/ProductCard';
import { useProducts } from 'hooks/useProducts';

const POPUP_WIDTH = 520;
const POPUP_HEIGHT = 620;

const formatRupiah = (value: number) => `Rp${value.toLocaleString('id-ID')}`;

const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { mutateAsync: loginWithGoogle } = useGoogleLogin();
  const { data: productsResult = [], isLoading: isLoadingProducts, error: productsError } = useProducts();
  const [isPending, setIsPending] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const popupRef = useRef<Window | null>(null);

  const featuredProducts: ProductCardItem[] = productsResult.map((product) => ({
    id: product.id,
    name: product.name,
    summary: product.summary,
    imageUrl: product.imageUrl,
    originalPriceLabel: formatRupiah(product.originalPrice),
    discountedPriceLabel: formatRupiah(product.discountedPrice),
    points: product.points,
  }));

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin) return;
      if (event.data?.type === 'GOOGLE_LOGIN_SUCCESS') {
        setAuthenticatedSession();
        setIsPending(false);
        popupRef.current?.close();
        navigate('/home', { replace: true });
      }
      if (event.data?.type === 'GOOGLE_LOGIN_ERROR') {
        setIsPending(false);
        setErrorMessage(event.data.message || 'Login Google gagal, silakan coba lagi.');
        popupRef.current?.close();
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [navigate]);

  const handleGoogleLogin = async () => {
    if (isPending) return;

    setErrorMessage('');
    try {
      const result = await loginWithGoogle();
      if (!result?.redirectUrl) throw new Error('Gagal mendapatkan URL login Google.');

      const left = window.screenX + (window.outerWidth - POPUP_WIDTH) / 2;
      const top = window.screenY + (window.outerHeight - POPUP_HEIGHT) / 2;
      const popup = window.open(
        result.redirectUrl,
        'google-login',
        `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes,resizable=yes`
      );

      if (!popup) {
        window.location.assign(result.redirectUrl);
        return;
      }

      popupRef.current = popup;
      setIsPending(true);

      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setIsPending(false);
        }
      }, 500);
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Login Google gagal, silakan coba lagi.');
    }
  };

  // Jika sudah login, tampilkan tombol ke dashboard
  const isLoggedIn = isAuthenticatedSession();

  const handleViewAllClick = (event?: React.MouseEvent<HTMLAnchorElement>) => {
    if (isPending) {
      event?.preventDefault();
      return;
    }

    if (isLoggedIn) {
      if (event) {
        return;
      }

      navigate('/home');
      return;
    }

    event?.preventDefault();
    void handleGoogleLogin();
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-6xl px-4 pb-12 pt-16 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-3 inline-block rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-800">
              Cravana Cookies
            </p>
            <h1 className="text-4xl font-bold leading-tight text-gray-900 sm:text-5xl">
              Cookies modern untuk teman ngemil setiap momen
            </h1>
            <p className="mt-4 max-w-xl text-base text-gray-600 sm:text-lg">
              Nikmati varian Original, Whey, dan Kurma dengan kualitas bahan terpilih dan rasa yang konsisten.
            </p>

            <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4">
              <h2 className="text-lg font-bold text-amber-900">Kenapa pilih Cravana?</h2>
              <ul className="mt-3 space-y-2 text-sm text-amber-900/90 sm:text-base">
                <li>• Baked fresh setiap batch untuk rasa yang konsisten.</li>
                <li>• Pilihan varian jelas untuk daily snack dan gifting.</li>
                <li>• Harga kompetitif dengan benefit point di setiap pembelian.</li>
              </ul>
            </div>

            <div className="mt-6 flex flex-wrap gap-3">
              <Button disabled={isPending} onClick={() => handleViewAllClick()}>
                {isPending ? 'Memproses...' : isLoggedIn ? 'Lihat semua' : 'Get Started'}
              </Button>
            </div>

            {errorMessage && (
              <p className="mt-3 text-sm text-red-600">{errorMessage}</p>
            )}
          </div>
          <Card className="overflow-hidden border-amber-100 bg-white p-0">
            <img
              src="https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80"
              alt="Ilustrasi gaya hidup sehat dengan snack sebelum olahraga"
              className="h-56 w-full object-cover sm:h-64"
              onError={(event) => {
                event.currentTarget.onerror = null;
                event.currentTarget.src = 'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=1200&q=80';
              }}
            />
            <div className="p-6">
              <h3 className="text-lg font-semibold text-gray-900">Healthy Cookies for Happy Moments</h3>
              <p className="mt-2 text-sm text-gray-600 sm:text-base">
                Cravana dirancang untuk gaya hidup sehat: low calorie, high protein, dan tinggi fiber.
                Cocok dinikmati keluarga saat kumpul maupun sebelum/sesudah olahraga.
              </p>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Low Calorie</span>
                <span className="rounded-full bg-blue-100 px-3 py-1 text-xs font-semibold text-blue-700">High Protein</span>
                <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-semibold text-amber-700">High Fiber</span>
              </div>
            </div>
          </Card>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-16 sm:px-6 lg:px-8">
        <div className="mb-5 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Featured Products</h2>
          <Link className="text-sm font-medium text-blue-600 hover:text-blue-700" to="/home" onClick={handleViewAllClick}>
            Lihat semua
          </Link>
        </div>
        {isLoadingProducts ? (
          <div className="rounded-lg border border-gray-200 bg-gray-50 px-4 py-3 text-sm text-gray-600">
            Memuat daftar produk...
          </div>
        ) : productsError ? (
          <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {productsError instanceof Error ? productsError.message : 'Gagal memuat produk'}
          </div>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProducts.map((product) => (
              <ProductCard key={product.id} product={product} hideActions />
            ))}
          </div>
        )}
      </section>
    </main>
  );
};

export default LandingPage;
