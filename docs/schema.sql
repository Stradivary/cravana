-- =====================================================================
-- Cravana - Schema Tabel Users
-- Jalankan di Supabase SQL Editor
-- =====================================================================

-- Extension UUID (biasanya sudah aktif di Supabase)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================================
-- Tabel: users
-- Menyimpan data user baik dari registrasi manual maupun Google OAuth.
-- Kolom password bersifat nullable — user yang login via Google tidak
-- memiliki password.
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.users (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  name          TEXT        NOT NULL,
  email         TEXT        NOT NULL UNIQUE,

  -- Password di-hash dengan bcrypt (nullable untuk user Google OAuth)
  password      TEXT        NULL,

  phone_number  TEXT        NULL,
  gender        TEXT        NULL  CHECK (gender IN ('male', 'female', 'other') OR gender IS NULL),
  address       TEXT        NULL,

  -- URL file KTP / foto profil (opsional)
  file_url      TEXT        NULL,

  -- true = sudah disetujui admin, false = pending approval
  approved      BOOLEAN     NOT NULL DEFAULT false,

  -- Provider login asal: 'email' atau 'google'
  provider      TEXT        NOT NULL DEFAULT 'email'
                CHECK (provider IN ('email', 'google')),

  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================================
-- Index untuk mempercepat lookup berdasarkan email
-- =====================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON public.users (email);

-- =====================================================================
-- Trigger: auto-update kolom updated_at setiap kali row diupdate
-- =====================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_users_updated_at ON public.users;
CREATE TRIGGER trg_users_updated_at
  BEFORE UPDATE ON public.users
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =====================================================================
-- Row Level Security (RLS)
-- Backend menggunakan service_role_key sehingga bypass RLS.
-- Policy di bawah hanya untuk keamanan tambahan jika ada direct client.
-- =====================================================================
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Service role bypass semua (default Supabase behavior)
-- Policy tambahan: user hanya bisa baca data dirinya sendiri
-- (tidak dipakai backend tapi berguna untuk future client-side queries)
CREATE POLICY "users_select_own"
  ON public.users
  FOR SELECT
  USING (auth.uid()::text = id::text);

-- =====================================================================
-- Contoh: mengubah password (gunakan di backend, password di-hash bcrypt)
-- UPDATE public.users
-- SET password = '<bcrypt_hash_baru>'
-- WHERE email = 'user@example.com';
-- =====================================================================


-- =====================================================================
-- Cravana - Schema Tabel Products
-- Menyimpan katalog produk untuk ditampilkan di halaman Home/Listing.
-- =====================================================================
CREATE TABLE IF NOT EXISTS public.products (
  id                UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug              TEXT        NOT NULL UNIQUE,
  name              TEXT        NOT NULL,
  summary           TEXT        NOT NULL,
  image_url         TEXT        NOT NULL,

  -- Harga disimpan dalam integer (rupiah) agar aman dari floating point error
  original_price    INTEGER     NOT NULL CHECK (original_price > 0),
  discounted_price  INTEGER     NOT NULL CHECK (discounted_price > 0 AND discounted_price <= original_price),

  points            INTEGER     NOT NULL DEFAULT 0 CHECK (points >= 0),
  stock             INTEGER     NOT NULL DEFAULT 0 CHECK (stock >= 0),
  is_active         BOOLEAN     NOT NULL DEFAULT true,

  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index katalog produk
CREATE INDEX IF NOT EXISTS idx_products_name ON public.products (name);
CREATE INDEX IF NOT EXISTS idx_products_is_active ON public.products (is_active);
CREATE INDEX IF NOT EXISTS idx_products_created_at ON public.products (created_at DESC);

-- Trigger updated_at untuk products
DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Public read untuk produk aktif
DROP POLICY IF EXISTS "products_public_read_active" ON public.products;
CREATE POLICY "products_public_read_active"
  ON public.products
  FOR SELECT
  USING (is_active = true);

-- Seed contoh data produk
INSERT INTO public.products (slug, name, summary, image_url, original_price, discounted_price, points, stock)
VALUES
  (
    'cookies-original',
    'Cookies Original',
    'Klasik, rich butter, dan cocok untuk semua kalangan.',
    'https://images.unsplash.com/photo-1499636136210-6f4ee915583e?auto=format&fit=crop&w=900&q=80',
    45000,
    35000,
    120,
    100
  ),
  (
    'cookies-whey',
    'Cookies Whey',
    'Pilihan snack tinggi protein untuk gaya hidup aktif.',
    'https://images.unsplash.com/photo-1590080874088-eec64895b423?auto=format&fit=crop&w=900&q=80',
    52000,
    42000,
    150,
    100
  ),
  (
    'cookies-kurma',
    'Cookies Kurma',
    'Sentuhan manis alami dengan profil rasa premium.',
    'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?auto=format&fit=crop&w=900&q=80',
    48000,
    39000,
    135,
    100
  )
ON CONFLICT (slug) DO NOTHING;


-- =====================================================================
-- Cravana - Schema Tabel Cart Items
-- Menyimpan item keranjang belanja per user (satu baris per produk per user).
-- =====================================================================

CREATE TABLE IF NOT EXISTS public.cart_items (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id         UUID        NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  product_id      UUID        NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity        INTEGER     NOT NULL DEFAULT 1 CHECK (quantity > 0),

  -- Snapshot harga saat item ditambahkan ke cart.
  -- Penting: agar harga cart tidak berubah saat admin update harga produk.
  price_snapshot  INTEGER     NOT NULL CHECK (price_snapshot > 0),

  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Satu user hanya boleh punya satu baris per produk.
  -- Jika produk sudah ada, UPDATE quantity menggunakan ON CONFLICT.
  UNIQUE (user_id, product_id)
);

-- Index
CREATE INDEX IF NOT EXISTS idx_cart_items_user_id    ON public.cart_items (user_id);
CREATE INDEX IF NOT EXISTS idx_cart_items_product_id ON public.cart_items (product_id);

-- Trigger updated_at untuk cart_items
DROP TRIGGER IF EXISTS trg_cart_items_updated_at ON public.cart_items;
CREATE TRIGGER trg_cart_items_updated_at
  BEFORE UPDATE ON public.cart_items
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Row Level Security
ALTER TABLE public.cart_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "cart_items_select_own"
  ON public.cart_items FOR SELECT
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "cart_items_insert_own"
  ON public.cart_items FOR INSERT
  WITH CHECK (auth.uid()::text = user_id::text);

CREATE POLICY "cart_items_update_own"
  ON public.cart_items FOR UPDATE
  USING (auth.uid()::text = user_id::text);

CREATE POLICY "cart_items_delete_own"
  ON public.cart_items FOR DELETE


  -- =====================================================================
  -- Cravana - Schema Tabel Orders & Order Items
  -- =====================================================================

  CREATE TABLE IF NOT EXISTS public.orders (
    id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id             UUID        NOT NULL REFERENCES public.users(id) ON DELETE RESTRICT,
    buyer_name          TEXT        NOT NULL,
    buyer_phone         TEXT        NOT NULL,
    buyer_address       TEXT        NOT NULL,
    total_amount        INTEGER     NOT NULL CHECK (total_amount > 0),
    status              TEXT        NOT NULL DEFAULT 'pending'
                        CHECK (status IN ('pending', 'paid', 'expired', 'failed', 'cancelled')),
    payment_method      TEXT        NOT NULL DEFAULT 'qris',
    xendit_reference_id TEXT        NULL UNIQUE,
    xendit_qr_id        TEXT        NULL,
    xendit_qr_string    TEXT        NULL,
    xendit_expires_at   TIMESTAMPTZ NULL,
    paid_at             TIMESTAMPTZ NULL,
    created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  CREATE TABLE IF NOT EXISTS public.order_items (
    id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id      UUID        NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
    product_id    UUID        NOT NULL REFERENCES public.products(id) ON DELETE RESTRICT,
    product_name  TEXT        NOT NULL,
    quantity      INTEGER     NOT NULL CHECK (quantity > 0),
    unit_price    INTEGER     NOT NULL CHECK (unit_price > 0),
    subtotal      INTEGER     NOT NULL CHECK (subtotal > 0),
    created_at    TIMESTAMPTZ NOT NULL DEFAULT now()
  );

  -- Index
  CREATE INDEX IF NOT EXISTS idx_orders_user_id          ON public.orders (user_id);
  CREATE INDEX IF NOT EXISTS idx_orders_status           ON public.orders (status);
  CREATE INDEX IF NOT EXISTS idx_order_items_order_id    ON public.order_items (order_id);

  -- Trigger updated_at untuk orders
  DROP TRIGGER IF EXISTS trg_orders_updated_at ON public.orders;
  CREATE TRIGGER trg_orders_updated_at
    BEFORE UPDATE ON public.orders
    FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

  -- Row Level Security
  ALTER TABLE public.orders      ENABLE ROW LEVEL SECURITY;
  ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "orders_select_own"
    ON public.orders FOR SELECT
    USING (auth.uid()::text = user_id::text);

  CREATE POLICY "order_items_select_via_order"
    ON public.order_items FOR SELECT
    USING (
      EXISTS (
        SELECT 1 FROM public.orders o
        WHERE o.id = order_id AND auth.uid()::text = o.user_id::text
      )
    );
  USING (auth.uid()::text = user_id::text);
