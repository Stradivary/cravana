import React from 'react';
import { Button } from 'components/atoms/Button';
import { Bell, ShoppingCart } from 'lucide-react';

type HomeHeaderProps = {
  cartTotalQuantity: number;
  userInitials: string;
  isUserMenuOpen: boolean;
  isLoggingOut: boolean;
  userMenuRef: React.RefObject<HTMLDivElement | null>;
  onToggleUserMenu: () => void;
  onViewProfile: () => void;
  onLogout: () => void;
  onCartClick?: () => void;
};

export const HomeHeader: React.FC<HomeHeaderProps> = ({
  cartTotalQuantity,
  userInitials,
  isUserMenuOpen,
  isLoggingOut,
  userMenuRef,
  onToggleUserMenu,
  onViewProfile,
  onLogout,
  onCartClick,
}) => {
  return (
    <section className="border-b bg-amber-50/60">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <div>
          <p className="text-xs font-semibold tracking-wide text-amber-700">CRAVANA</p>
          <h1 className="text-xl font-bold text-gray-900">Home</h1>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            aria-label="Notifikasi"
            variant="secondary"
            className="inline-flex h-11 w-11 items-center justify-center rounded-full p-0"
          >
            <Bell size={22} />
          </Button>
          <div className="relative">
            <Button
              type="button"
              aria-label="Keranjang Pesanan"
              variant="secondary"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full p-0"
              onClick={onCartClick}
            >
              <ShoppingCart size={22} />
            </Button>
            {cartTotalQuantity > 0 ? (
              <span className="absolute -right-1 -top-1 inline-flex min-h-5 min-w-5 items-center justify-center rounded-full bg-red-600 px-1 text-xs font-semibold text-white">
                {cartTotalQuantity}
              </span>
            ) : null}
          </div>
          <div className="relative" ref={userMenuRef}>
            <Button
              type="button"
              aria-label="Profil User"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full p-0 text-sm font-semibold"
              onClick={onToggleUserMenu}
            >
              {userInitials}
            </Button>

            {isUserMenuOpen ? (
              <div className="absolute right-0 top-12 z-30 w-44 rounded-lg border bg-white p-2 shadow-lg">
                <Button type="button" variant="secondary" className="mb-2 w-full" onClick={onViewProfile}>
                  Lihat Profile
                </Button>
                <Button type="button" className="w-full" onClick={onLogout} disabled={isLoggingOut}>
                  {isLoggingOut ? 'Memproses...' : 'Logout'}
                </Button>
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
};
