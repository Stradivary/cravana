# Product Requirements — Cravana MVP

## Project

`Cravana` adalah brand cookies yang membutuhkan platform digital untuk memperkenalkan produk dan memfasilitasi pembelian online secara langsung.

## Product Goal

Membangun website dan alur pembelian online yang:
- memperkuat branding `Cravana`,
- memudahkan user melihat produk,
- memungkinkan pembelian cepat dari perangkat mobile,
- mendukung login sederhana,
- menyediakan pembayaran QRIS melalui Xendit.

## Target Users

- calon pembeli yang datang dari iklan, sosial media, atau referral,
- pelanggan yang ingin memesan cookies dengan cepat,
- pelanggan yang ingin login agar data checkout dan riwayat order bisa lebih rapi.

## Functional Requirements

### 1. Landing Page & Brand Website
- Sistem menyediakan landing page yang menampilkan:
	- hero section,
	- dual CTA utama (`Get Started` dan `Sign In`),
	- value proposition brand,
	- highlight produk unggulan,
	- CTA untuk lihat produk atau beli sekarang.
- Tampilan harus sederhana, conversion-oriented, dan mobile-first.
- Struktur visual dapat mengambil inspirasi dari pendekatan minimal, rapi, dan fokus CTA seperti referensi situs sample, termasuk section `Digital Menu`, `Order Flow`, dan `Mobile First`.

### 2. Home Page
- Sistem menyediakan halaman home/menu yang merangkum brand, produk favorit, dan CTA menuju katalog.
- Home harus bisa berfungsi sebagai pintu masuk utama dari traffic organik maupun ads.

### 3. Product Listing
- User dapat melihat daftar produk cookies.
- Produk minimal mencakup:
	- Cookies Original
	- Cookies Whey
	- Cookies Kurma
- Setiap item menampilkan nama, gambar, deskripsi singkat, harga, dan CTA tambah ke cart.

### 4. Product Card
- Product card harus reusable dan konsisten di home maupun product list.
- Card menampilkan informasi paling penting untuk mendorong klik dan pembelian.

### 5. Authentication
- User dapat login menggunakan Gmail / Google sign-in.
- User dapat login atau verifikasi menggunakan nomor HP.
- Sistem harus menyimpan identitas user secara aman.
- Entry autentikasi harus mudah ditemukan dari landing/home melalui CTA `Sign In`.

### 5A. Discover-to-SignIn Flow
- User dari landing dapat memilih:
	- `Get Started` untuk masuk home/menu,
	- `Sign In` untuk masuk autentikasi.
- Sistem harus menjaga redirect behavior yang konsisten dan tidak membingungkan user.

### 6. Cart
- User dapat menambahkan produk ke cart.
- User dapat mengubah kuantitas item.
- User dapat menghapus item dari cart.
- Sistem menampilkan subtotal dengan jelas.

### 7. Checkout
- User dapat melanjutkan dari cart ke checkout.
- Checkout minimal mencakup:
	- data pembeli,
	- nomor HP,
	- alamat atau informasi pengiriman bila dibutuhkan,
	- ringkasan item dan total pembayaran.

### 8. Payment
- Sistem membuat transaksi pembayaran dari checkout.
- Sistem mengintegrasikan QRIS melalui Xendit.
- User dapat melihat status pembayaran.
- Backend menerima webhook/callback untuk memperbarui status order.

### 9. Order Tracking Dasar
- Sistem menyimpan order beserta status pembayaran.
- User menerima konfirmasi setelah pembayaran berhasil.

## Non-Functional Requirements

- UI responsif, cepat, dan nyaman di mobile.
- Styling harus terasa modern, bersih, dan cocok untuk brand F&B premium-accessible.
- TypeScript strict harus dijaga.
- Validasi form wajib konsisten.
- Alur checkout dan payment harus aman dan dapat diaudit.
- Integrasi frontend, backend, dan Supabase harus modular agar mudah dikembangkan.

## Out of Scope for Initial MVP

- dashboard admin lengkap,
- sistem promo kompleks,
- voucher atau loyalty program,
- multi-warehouse atau fulfillment kompleks,
- analitik bisnis mendalam.

## Success Indicators

- user bisa masuk ke website dan memahami brand dengan cepat,
- user bisa melihat daftar produk dan menambahkan ke cart tanpa friksi,
- user bisa checkout dan membayar via QRIS,
- status order dan payment tercatat dengan benar.

## KPI Target (Initial Baseline)

- Landing-to-product CTR minimal 20%
- Add-to-cart rate minimal 8%
- Checkout completion rate minimal 35% dari user yang membuka cart
- QRIS payment success rate minimal 90% dari transaksi yang dibuat
- Median waktu dari landing ke submit checkout maksimal 4 menit

## Release Readiness Criteria

- Semua flow MVP (`browse -> cart -> checkout -> payment`) dapat dijalankan end-to-end.
- Error handling pada auth, checkout, dan payment tampil jelas di frontend.
- Webhook payment tervalidasi dan mencatat log callback.
- Dokumentasi environment variables untuk frontend/backend lengkap.
- Planning artifacts konsisten dengan `project-context.md`.

## Referensi

- `../project-context.md`
