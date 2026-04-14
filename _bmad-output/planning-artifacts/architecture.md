# Architecture Design — Cravana

## Overview

Proyek `Cravana` menggunakan base code dua aplikasi:
- `frontend/` sebagai aplikasi user-facing,
- `backend/` sebagai API dan orchestration layer.

Arsitektur diarahkan untuk mendukung website brand sekaligus e-commerce flow sederhana.

## High-Level Components

### 1. Frontend Application
Teknologi saat ini:
- React
- TypeScript
- React Router
- React Hook Form
- Zod
- TanStack Query
- TailwindCSS

Tanggung jawab frontend:
- landing page dan home,
- product list dan product card,
- login / register flow,
- cart dan checkout UI,
- payment status page,
- konsumsi API backend.

### 2. Backend Application
Teknologi saat ini:
- Next.js API project
- TypeScript
- Supabase server client
- JWT / cookie-based session helper

Tanggung jawab backend:
- autentikasi dan session orchestration,
- penyediaan data produk,
- cart dan checkout processing,
- pembuatan transaksi pembayaran,
- webhook handling dari Xendit,
- akses data ke Supabase PostgreSQL.

### 3. Database Layer
Database utama: Supabase PostgreSQL

Entitas awal yang disarankan:
- `users`
- `user_profiles`
- `products`
- `product_categories`
- `carts`
- `cart_items`
- `orders`
- `order_items`
- `payments`
- `payment_webhook_logs`

## Suggested Flow Architecture

### A. Browsing Flow
1. User membuka landing page.
2. Frontend menampilkan CTA `Get Started` dan `Sign In` + section `Digital Menu`, `Order Flow`, `Mobile First`.
3. User memilih `Get Started` untuk masuk ke home/menu produk.
4. User masuk ke product list untuk melihat semua produk.

### B. Authentication Flow
1. User memilih `Sign In` dari landing/home.
2. User memilih login dengan Google atau nomor HP.
3. Frontend mengirim request ke backend.
4. Backend memvalidasi identitas dan membuat session.
5. Session disimpan dengan mekanisme yang aman.

### C. Cart & Checkout Flow
1. User menambahkan produk ke cart.
2. Frontend menyimpan state cart dan/atau sinkron ke backend.
3. Saat checkout, frontend mengirim data checkout ke backend.
4. Backend membuat order draft dan payment record.

### D. Payment Flow
1. Backend membuat request pembayaran QRIS ke Xendit.
2. Xendit mengembalikan data transaksi/QR payload.
3. Frontend menampilkan instruksi pembayaran ke user.
4. Xendit mengirim webhook ke backend saat status pembayaran berubah.
5. Backend memperbarui status `payments` dan `orders` di Supabase.

## API Surface (Planned)

### Auth
- `POST /api/auth/google`
- `POST /api/auth/phone/request-otp`
- `POST /api/auth/phone/verify-otp`
- `POST /api/auth/logout`
- `GET /api/auth/session`

### Products
- `GET /api/products`
- `GET /api/products/:id`

### Cart
- `GET /api/cart`
- `POST /api/cart/items`
- `PATCH /api/cart/items/:id`
- `DELETE /api/cart/items/:id`

### Checkout & Orders
- `POST /api/checkout`
- `GET /api/orders/:id`
- `GET /api/orders/:id/payment-status`

### Payments
- `POST /api/payments/qris`
- `POST /api/webhooks/xendit`

## UI / UX Direction

- visual harus clean, minimal, dan fokus pada CTA,
- mobile-first,
- cepat dipahami untuk first-time visitor,
- tone cocok untuk brand makanan modern,
- layout landing page mengikuti pola sederhana: hero, dual CTA (`Get Started` + `Sign In`), `Digital Menu`, `Order Flow`, `Mobile First`, CTA repeat.

## Frontend Detail Architecture (Landing, Home, Login Google)

Bagian ini melengkapi desain arsitektur existing, khusus untuk prioritas MVP frontend sesuai `project-context`, `product-brief`, dan `requirements`.

### A. Route Architecture (Phase-1)

- `/` -> `LandingPage`
- `/home` -> `HomePage`
- `/login` -> `LoginPage` (Google Sign-In)
- `/register` -> `RegisterPage` (opsional, mengikuti CTA `Get Started` jika dibutuhkan)
- fallback route diarahkan ke `/` agar mendukung discovery flow dari traffic ads/organik.

### B. Landing Page Architecture

Tujuan:
- memperkenalkan value proposition brand `Cravana`,
- mendorong klik ke home/katalog,
- menyiapkan entry point untuk login sebelum transaksi.

Komposisi section yang direkomendasikan:
1. Hero section + dual CTA (`Get Started` / `Sign In`)
2. `Digital Menu` highlights (produk unggulan)
3. `Order Flow` highlights (alur pesan ringkas)
4. `Mobile First` highlights (responsif dan cepat)
5. CTA repeat di bagian bawah

Komponen frontend:
- `HeroSection`
- `DigitalMenuSection`
- `OrderFlowSection`
- `MobileFirstSection`
- `PrimaryCtaSection`

State & data:
- data featured products dapat diambil dari `GET /api/products` (subset),
- loading/error state wajib menampilkan fallback UI non-blocking,
- data fetching menggunakan TanStack Query.

### C. Home Page Architecture

Tujuan:
- menjadi pintu masuk utama user setelah landing,
- menampilkan ringkasan brand + produk favorit,
- mengarahkan user ke product listing/cart flow berikutnya.

Komposisi halaman:
1. Header navigasi sederhana (brand, login, CTA)
2. Highlight produk favorit (reuse product card)
3. Ringkasan kategori/varian (Original, Whey, Kurma)
4. CTA ke katalog lengkap

Prinsip implementasi:
- reuse `ProductCard` yang sama dengan landing untuk konsistensi,
- hierarchy CTA harus jelas (hindari lebih dari satu CTA primer di satu viewport),
- tetap mobile-first untuk menjaga conversion funnel.

### D. Login with Google Architecture

Tujuan:
- autentikasi cepat dengan friksi minimum,
- menyiapkan session aman untuk flow cart/checkout.

Frontend flow:
1. User klik tombol `Masuk dengan Google` pada `/login`.
2. Frontend trigger `POST /api/auth/google`.
3. Backend menyelesaikan OAuth (redirect/token exchange) dan membuat session.
4. Frontend verifikasi hasil login melalui `GET /api/auth/session`.
5. Jika valid, redirect ke `/home` (atau intended route).

Kontrak state session frontend:
- `isAuthenticated`
- `userId`
- `email`
- `provider = google`

Error handling minimal:
- OAuth gagal -> tampilkan error yang actionable + tombol coba lagi,
- session invalid/expired -> tetap di `/login`,
- network timeout -> tampilkan notifikasi tanpa crash halaman.

Security baseline (frontend):
- tidak menyimpan token sensitif di `localStorage`,
- gunakan cookie/session aman dari backend,
- logout harus membersihkan cache query terkait session/user.

### E. Struktur Folder Frontend yang Disarankan

Untuk menjaga keterbacaan dan maintainability:

- `src/pages/marketing/LandingPage.tsx`
- `src/pages/marketing/HomePage.tsx`
- `src/pages/auth/LoginPage.tsx`
- `src/components/organisms/marketing/*`
- `src/components/molecules/auth/GoogleLoginButton.tsx`
- `src/hooks/useAuth.ts`
- `src/services/auth/authService.ts`
- `src/schemas/auth/*` (opsional untuk validasi response session)

Catatan:
- Struktur ini melengkapi base code saat ini yang masih fokus auth/dashboard,
- pemisahan `marketing` dan `auth` membantu evolusi ke fitur checkout tanpa refactor besar.

### F. Acceptance Criteria Teknis (3 Halaman Prioritas)

1. Route `/`, `/home`, `/login` dapat diakses normal pada web mobile dan desktop.
2. Landing page memuat section wajib: hero, value highlights, featured products, CTA.
3. Home page menampilkan ringkasan brand dan daftar produk favorit reusable.
4. Tombol login Google memicu flow auth backend dan menghasilkan session valid.
5. Error state pada login tampil jelas tanpa merusak navigasi utama.

### G. Implementation Sequence yang Direkomendasikan

1. Update router frontend untuk menambah route marketing.
2. Implement `LandingPage` dan reusable section components.
3. Implement `HomePage` dengan reuse `ProductCard`.
4. Refactor `LoginPage` ke flow Google Sign-In.
5. Tambahkan bootstrap session check (`GET /api/auth/session`) setelah login.

## Engineering Rules

- gunakan TypeScript strict,
- validasi request/response penting dengan Zod,
- pertahankan separation of concerns antara page, feature, service, dan schema,
- semua integrasi payment harus diproteksi dari request palsu,
- semua callback payment harus dicatat untuk audit trail.

## Migration Note from Base Code

Base code saat ini masih berorientasi pada auth dashboard. Transformasi ke `Cravana` dilakukan dengan strategi berikut:
- mempertahankan fondasi tooling dan struktur proyek,
- mengganti domain model dari user management ke commerce,
- menambahkan halaman publik dan flow pembelian,
- memperluas backend dari auth API menjadi commerce + payment API.

## Referensi

- `../project-context.md`
- `product-brief.md`
- `requirements.md`
