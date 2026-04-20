import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import { Button } from 'components/atoms/Button';
import { Card } from 'components/atoms/Card';
import { Dialog, DialogContent, DialogTitle } from 'components/atoms/Dialog';
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
  const [isQrModalOpen, setIsQrModalOpen] = useState(false);
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

  const surveyUrl = useMemo(() => {
    if (typeof window === 'undefined') {
      return 'https://cravana.vercel.app/survey';
    }

    return `${window.location.origin}/survey`;
  }, []);

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

        <Card className="mt-8 overflow-hidden border-amber-100 bg-white p-0">
          <div className="grid items-stretch gap-0 md:grid-cols-[1fr_auto]">
            <div className="flex items-center gap-4 p-4 sm:p-5">
              <img
                src="https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80"
                alt="Cookies Cravana"
                className="h-24 w-28 flex-shrink-0 rounded-lg object-cover sm:h-28 sm:w-36"
              />

              <div className="min-w-0">
                <p className="inline-block rounded-full bg-amber-100 px-2.5 py-1 text-[11px] font-semibold text-amber-800">
                  Survey Review Cravana
                </p>
                <h3 className="mt-2 text-base font-bold text-gray-900 sm:text-lg">
                  Yuk bantu review produk Cravana
                </h3>
                <p className="mt-1 text-xs leading-5 text-gray-600 sm:text-sm">
                  Scan barcode atau klik tombol untuk isi survey singkat pengalaman produk favoritmu.
                </p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button asChild className="px-3 py-2 text-xs sm:text-sm">
                    <Link to="/survey">Isi survey</Link>
                  </Button>
                  <a
                    className="inline-flex items-center rounded-md border border-gray-300 px-3 py-2 text-xs font-medium text-gray-700 hover:bg-gray-100 sm:text-sm"
                    href={surveyUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Buka link
                  </a>
                </div>
              </div>
            </div>

            <div className="border-t border-amber-100 bg-amber-50 p-4 text-center md:border-l md:border-t-0">
              <p className="text-xs font-semibold text-amber-900">Barcode Survey</p>
              <button
                type="button"
                className="mt-2 rounded-md border border-amber-200 bg-white p-1.5 transition hover:bg-amber-100/40"
                onClick={() => setIsQrModalOpen(true)}
                aria-label="Perbesar barcode survey"
              >
                <QRCodeSVG
                  value={surveyUrl}
                  size={112}
                  level="M"
                  includeMargin
                  bgColor="#FFFFFF"
                  fgColor="#111827"
                  className="mx-auto w-24 rounded-md sm:w-28"
                />
              </button>
              <p className="mt-2 text-[11px] text-amber-900/80">Klik barcode untuk perbesar</p>
            </div>
          </div>
        </Card>

        <Dialog open={isQrModalOpen} onOpenChange={setIsQrModalOpen}>
          <DialogContent className="w-[calc(100%-2rem)] max-w-md p-5 sm:p-6">
            <DialogTitle className="text-base font-semibold text-gray-900">Barcode Survey Cravana</DialogTitle>
            <p className="mt-1 text-xs text-gray-500">Scan barcode ini untuk membuka halaman survey.</p>
            <div className="mt-4 rounded-xl border border-amber-100 bg-amber-50 p-3">
              <div className="mx-auto w-full max-w-[320px] rounded-lg border border-amber-200 bg-white p-2">
                <QRCodeSVG
                  value={surveyUrl}
                  size={300}
                  level="M"
                  includeMargin
                  bgColor="#FFFFFF"
                  fgColor="#111827"
                  className="mx-auto h-auto w-full"
                />
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </section>
    </main>
  );
};

export default LandingPage;
