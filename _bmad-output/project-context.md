# Project Context

## System Context (Ringkasan)

Project: Cravana
Domain: F&B / D2C Cookies Brand
Tujuan: Menggunakan base code BMAD multi-app ini untuk membangun ekosistem digital brand cookies `Cravana`, yang mencakup website brand, landing page promosi, frontend e-commerce, dan backend untuk autentikasi, katalog, cart, checkout, dan pembayaran.

Brand & Produk Utama:
- Cookies Original
- Cookies Whey
- Cookies Kurma

Komponen Sistem:
- frontend: aplikasi React + TypeScript untuk website publik, landing page, katalog produk, cart, checkout, dan alur login user.
- backend: aplikasi Next.js + TypeScript untuk API autentikasi, data produk, cart/checkout, integrasi Supabase, dan integrasi pembayaran Xendit.
- database: Supabase PostgreSQL untuk user, profil, produk, cart, order, dan status pembayaran.

## Product Vision

Cravana adalah brand cookies modern yang menjual produk secara online dengan pengalaman belanja yang cepat, rapi, dan terpercaya. Platform ini harus mendukung:
- pengenalan brand melalui landing page dan website utama,
- eksplorasi produk cookies secara mudah,
- pembelian langsung melalui cart dan checkout,
- autentikasi sederhana menggunakan Gmail dan nomor HP,
- pembayaran digital berbasis QRIS melalui Xendit.

## UX Flow Baseline (Acuan Referensi)

Flow UX phase sekarang mengacu pada pola sederhana berikut:
1. User membuka landing page.
2. User melihat CTA utama: `Get Started` dan `Sign In`.
3. User melihat value sections: `Digital Menu`, `Order Flow`, `Mobile First`.
4. User menuju home/menu untuk memilih produk.
5. User login (Google/HP) sebelum melanjutkan transaksi.

Interpretasi untuk domain `Cravana`:
- `Digital Menu` = katalog/daftar cookies
- `Order Flow` = alur pilih produk -> cart -> checkout -> payment
- `Mobile First` = prioritas performa dan UX pada viewport mobile

## MVP Scope

Fitur inti fase awal:
- Landing page / brand website
- Home page
- CTA ganda `Get Started` + `Sign In` pada landing
- Product listing
- Product card / preview produk
- Detail produk dasar bila diperlukan oleh UI flow
- Cart
- Checkout
- Login dengan Gmail
- Login / verifikasi dengan nomor HP
- Pembayaran QRIS melalui Xendit
- Status order dan status pembayaran

Prioritas implementasi bertahap:
- Phase 1: Landing + Home/Menu + Sign In entry (Google)
- Phase 2: Cart + Checkout + Payment QRIS + Status order

## High-Level User Flows

### 1. Discovery Flow
User masuk ke landing page, melihat CTA `Get Started`/`Sign In`, memahami value utama, lalu masuk ke home/menu produk.

### 2. Shopping Flow
User membuka daftar produk, memilih varian cookies, menambahkan produk ke cart, lalu melanjutkan ke checkout.

### 3. Authentication Flow
User dapat login atau register menggunakan:
- Gmail / Google sign-in
- nomor HP (OTP atau mekanisme verifikasi yang disepakati pada tahap implementasi)

Untuk fase sekarang, entry autentikasi utama diprioritaskan melalui tombol `Sign In` yang terlihat jelas pada landing/home.

### 4. Payment Flow
Setelah checkout, sistem membuat transaksi dan menampilkan metode pembayaran QRIS melalui Xendit. Backend menyimpan status transaksi dan memperbarui status order setelah notifikasi pembayaran diterima.

## Technology Stack & Versions

- Node.js 20.x
- TypeScript 5.x
- React 18.x pada frontend
- Next.js 14.x pada backend
- Supabase PostgreSQL
- React Hook Form
- Zod
- React Query / TanStack Query
- TailwindCSS
- Xendit API untuk pembayaran QRIS

## Core Domain Entities

- `User`
- `UserProfile`
- `Product`
- `ProductCategory`
- `Cart`
- `CartItem`
- `Order`
- `OrderItem`
- `Payment`
- `PaymentWebhookLog`

## Critical Implementation Rules

- Base code saat ini diperlakukan sebagai fondasi teknis, tetapi arah produk berubah sepenuhnya ke bisnis F&B brand `Cravana`.
- Strict TypeScript mode; hindari `any` tanpa alasan yang jelas.
- Validasi input frontend dan backend harus konsisten menggunakan Zod bila memungkinkan.
- Form dikelola dengan React Hook Form.
- Data fetching frontend menggunakan React Query / TanStack Query.
- Styling harus konsisten, modern, mobile-first, dan sesuai positioning brand F&B premium-modern.
- Backend Next.js menjadi sumber utama business logic, integrasi Supabase, dan integrasi Xendit.
- Autentikasi harus mendukung Google/Gmail sign-in serta login nomor HP.
- Semua endpoint checkout dan payment wajib aman, tervalidasi, dan dapat diaudit.
- Integrasi pembayaran harus menggunakan QRIS melalui Xendit, termasuk callback/webhook untuk sinkronisasi status.
- Data order, payment, dan identitas user harus tersimpan rapi dan siap dikembangkan untuk kebutuhan operasional bisnis.
- Semua artefak BMAD berikutnya harus mengacu ke konteks proyek `Cravana`, bukan lagi konteks login/register generik.

## Information Architecture Awal

Halaman utama yang diperkirakan ada pada fase awal:
- Landing Page
- Home
- Product List
- Cart
- Checkout
- Login / Register
- Payment Status / Order Confirmation

## Multi-App Context

- folder `frontend` berperan sebagai aplikasi user-facing untuk brand dan e-commerce flow.
- folder `backend` berperan sebagai API layer, auth orchestration, data layer, dan payment integration.
- seluruh planning dan implementation artifacts di `_bmad-output` harus mengikuti konteks `Cravana`.

## Notes for Planning

- Fokus awal adalah membentuk pengalaman e-commerce sederhana namun siap jual.
- Copywriting, visual direction, dan struktur landing page harus menonjolkan kualitas produk cookies dan kepercayaan brand.
- Arsitektur perlu disiapkan agar mudah berkembang ke promo, voucher, dashboard order, dan admin di fase berikutnya.

## Referensi

- BMAD project-context guidance: https://docs.bmad-method.org/explanation/project-context/
