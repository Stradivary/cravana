import React, { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from 'components/atoms/Button';
import { Dialog, DialogClose, DialogContent, DialogTitle } from 'components/atoms/Dialog';
import { clearAuthenticatedSession, isAuthenticatedSession } from 'lib/auth-session';
import { useAuthProfile, useLogout } from 'hooks/useAuth';
import { ProductCard, type ProductCardItem } from 'components/molecules/ProductCard';
import { useProducts } from 'hooks/useProducts';
import { HomeHeader } from 'components/organisms/HomeHeader/index';
import { CartDrawer } from 'components/organisms/CartDrawer';
import { useCart, useAddToCart } from 'hooks/useCart';

const formatRupiah = (value: number) => `Rp${value.toLocaleString('id-ID')}`;

const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [logoutError, setLogoutError] = useState('');
  const [addToCartError, setAddToCartError] = useState('');
  const userMenuRef = useRef<HTMLDivElement | null>(null);
  const { data: profileResult } = useAuthProfile();
  const { mutateAsync: logout, isPending: isLoggingOut } = useLogout();
  const { data: productsResult = [], isLoading: isLoadingProducts, error: productsError } = useProducts();
  const { data: cartData, isLoading: isLoadingCart, error: cartError } = useCart();
  const { mutateAsync: addToCart, isPending: isAddingToCart } = useAddToCart();

  const cartItems = cartData?.items ?? [];
  const cartTotal = cartData?.total ?? 0;
  const cartTotalQuantity = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  const products: ProductCardItem[] = productsResult.map((product) => ({
    id: product.id,
    name: product.name,
    summary: product.summary,
    imageUrl: product.imageUrl,
    originalPriceLabel: formatRupiah(product.originalPrice),
    discountedPriceLabel: formatRupiah(product.discountedPrice),
    points: product.points,
  }));

  const getQuantityInCart = (productId: string) => {
    const item = cartItems.find((i) => i.productId === productId);
    return item?.quantity ?? 0;
  };

  const handleAddToCart = async (productId: string) => {
    setAddToCartError('');
    if (!isAuthenticatedSession()) {
      navigate('/login');
      return;
    }
    try {
      await addToCart({ productId, quantity: 1 });
    } catch (error) {
      setAddToCartError(error instanceof Error ? error.message : 'Gagal menambahkan ke keranjang');
    }
  };

  const handleBuyNow = async (productId: string) => {
    setAddToCartError('');
    if (!isAuthenticatedSession()) {
      navigate('/login');
      return;
    }
    try {
      await addToCart({ productId, quantity: 1 });
      setIsCartOpen(true);
    } catch (error) {
      setAddToCartError(error instanceof Error ? error.message : 'Gagal menambahkan ke keranjang');
    }
  };

  const handleViewProfile = () => {
    setIsUserMenuOpen(false);
    setIsProfileModalOpen(true);
  };

  const handleLogout = async () => {
    setLogoutError('');

    try {
      await logout();
      clearAuthenticatedSession();
      setIsUserMenuOpen(false);
      navigate('/', { replace: true });
    } catch (error) {
      setLogoutError(error instanceof Error ? error.message : 'Gagal logout');
    }
  };

  const profile = profileResult?.profile;
  const userInitials = (profile?.name ?? 'U')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('') || 'U';

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (!userMenuRef.current) return;
      if (!userMenuRef.current.contains(event.target as Node)) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <HomeHeader
        cartTotalQuantity={cartTotalQuantity}
        userInitials={userInitials}
        isUserMenuOpen={isUserMenuOpen}
        isLoggingOut={isLoggingOut}
        userMenuRef={userMenuRef}
        onToggleUserMenu={() => setIsUserMenuOpen((open) => !open)}
        onViewProfile={handleViewProfile}
        onCartClick={() => setIsCartOpen(true)}
        onLogout={() => {
          void handleLogout();
        }}
      />

      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        items={cartItems}
        total={cartTotal}
        isLoading={isLoadingCart}
        error={cartError instanceof Error ? cartError.message : null}
      />

      <Dialog open={isProfileModalOpen} onOpenChange={setIsProfileModalOpen}>
        <DialogContent className="w-[calc(100%-2rem)] max-w-md">
          <DialogTitle className="text-lg font-semibold text-gray-800">Detail Profile</DialogTitle>

          <div className="mt-4 space-y-2 text-sm text-gray-700">
            <p>Nama: {profile?.name ?? '-'}</p>
            <p>Email: {profile?.email ?? '-'}</p>
            <p>Gender: {profile?.gender ?? '-'}</p>
            <p>No HP: {profile?.phoneNumber ?? '-'}</p>
            <p>Alamat: {profile?.address ?? '-'}</p>
            <p>Provider: {profile?.provider ?? '-'}</p>
          </div>

          <div className="mt-5 flex justify-end">
            <DialogClose asChild>
              <Button type="button" variant="secondary">Tutup</Button>
            </DialogClose>
          </div>
        </DialogContent>
      </Dialog>

      {logoutError ? (
        <section className="mx-auto mt-4 max-w-6xl px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-red-600">{logoutError}</p>
        </section>
      ) : null}

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Produk favorit Cravana</h2>
          <p className="mt-2 text-gray-600">Pilih varian favoritmu, lalu lanjutkan ke flow pembelian.</p>
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
            {products.map((item) => (
              <ProductCard
                key={item.id}
                product={item}
                quantityInCart={getQuantityInCart(item.id)}
                onAddToCart={(id) => { void handleAddToCart(id); }}
                onBuyNow={(id) => { void handleBuyNow(id); }}
              />
            ))}
          </div>
        )}

        {addToCartError ? (
          <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {addToCartError}
          </div>
        ) : null}

        {isAddingToCart ? (
          <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
            Menambahkan ke keranjang...
          </div>
        ) : null}

        {cartTotalQuantity > 0 ? (
          <div
            className="mt-6 flex cursor-pointer items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 hover:bg-emerald-100"
            onClick={() => setIsCartOpen(true)}
          >
            <span>
              Keranjang: <span className="font-semibold">{cartTotalQuantity}</span> item
            </span>
            <span className="font-bold">{formatRupiah(cartTotal)} →</span>
          </div>
        ) : null}
      </section>
    </main>
  );
};

export default HomePage;