# Story List for Dev Agent — Cravana MVP

## Epic A — Reframe Base Code to Cravana

### Story 1: Rebrand Project Foundation
- ubah copy, naming, route direction, dan dokumentasi agar sesuai dengan brand `Cravana`
- hapus atau deprecate narasi dashboard auth lama dari artefak produk
- siapkan fondasi design direction untuk website cookies

Acceptance Criteria:
- seluruh README utama, backend, frontend, dan `_bmad-output` menggunakan konteks `Cravana`
- tidak ada referensi aktif ke “Auth & User Management Dashboard” sebagai produk utama
- project context, requirements, architecture, stories konsisten satu sama lain

### Story 2: Frontend Shell for Public Commerce Experience
- ubah router frontend dari auth/dashboard-centric menjadi public-commerce-centric
- sediakan route awal untuk:
	- home
	- products
	- cart
	- checkout
	- login
	- payment status

Acceptance Criteria:
- route default mengarah ke home/landing, bukan dashboard
- route `/products`, `/cart`, `/checkout`, `/login`, `/payment-status` tersedia
- route protection untuk area yang butuh login dapat diaktifkan tanpa mengubah struktur besar router

## Epic B — Brand Website & Discovery Flow

### Story 3: Implement Landing Page / Home
- tampilkan hero section brand `Cravana`
- tampilkan dual CTA `Get Started` dan `Sign In`
- tampilkan section `Digital Menu`, `Order Flow`, dan `Mobile First`
- tampilkan section produk unggulan
- optimalkan untuk mobile-first dan conversion flow

Acceptance Criteria:
- landing page memuat hero, dual CTA, highlights, featured products
- layout terbaca baik pada viewport mobile
- `Get Started` mengarah ke home/menu
- `Sign In` mengarah ke halaman login

### Story 4: Implement Product Listing & Product Card
- tampilkan daftar produk cookies
- buat komponen product card reusable
- sediakan data structure untuk nama, harga, deskripsi, dan gambar

Acceptance Criteria:
- minimal 3 produk inti tampil di product list
- product card reusable dipakai di lebih dari satu section
- user bisa menambah produk ke cart dari product card

## Epic C — Authentication

### Story 5: Implement Login with Google
- user bisa login menggunakan akun Google / Gmail
- backend mengelola session user
- flow login dipicu dari CTA `Sign In` pada landing/home

Acceptance Criteria:
- user berhasil login Google dan mendapatkan session valid
- endpoint session check mengembalikan status login user
- logout menghapus session dengan benar

### Story 6: Implement Login with Phone Number
- user bisa meminta OTP ke nomor HP
- user bisa verifikasi OTP untuk masuk
- flow disiapkan agar mudah diintegrasikan dengan provider yang dipilih

Acceptance Criteria:
- request OTP berhasil untuk nomor valid
- verify OTP menghasilkan session valid
- kesalahan OTP invalid/expired ditampilkan jelas di UI

## Epic D — Shopping Flow

### Story 7: Implement Cart Experience
- tambah produk ke cart
- ubah kuantitas
- hapus item
- hitung subtotal dan total sementara

Acceptance Criteria:
- user bisa menambah, mengurangi, dan menghapus item cart
- subtotal dan total update real-time sesuai quantity
- cart state tetap konsisten saat refresh sesuai strategi state yang dipilih

### Story 8: Implement Checkout Experience
- form data pembeli
- ringkasan order
- validasi input checkout
- submit checkout ke backend

Acceptance Criteria:
- form checkout tervalidasi sebelum submit
- backend menerima order draft dengan item dan total
- user mendapat respons sukses/gagal yang jelas setelah submit

## Epic E — Payment Integration

### Story 9: Integrate Xendit QRIS Payment
- backend membuat transaksi QRIS
- frontend menampilkan status/instruksi pembayaran
- webhook Xendit memperbarui status payment dan order

Acceptance Criteria:
- endpoint payment membuat transaksi QRIS valid
- webhook diverifikasi token/signature sebelum update status
- status payment tersinkron ke order pada database

### Story 10: Payment Confirmation & Order Status
- user melihat status transaksi
- sistem menyimpan hasil pembayaran secara persisten
- tampilkan halaman sukses / pending / gagal

Acceptance Criteria:
- halaman status menampilkan state `success`, `pending`, atau `failed`
- payment status tetap benar saat halaman direfresh
- order confirmation memuat ringkasan order yang relevan

## Epic F — Operational Hardening

### Story 11: Data Modeling & Security Hardening
- finalisasi schema database user, product, cart, order, payment
- audit validation dan auth boundary
- pastikan endpoint payment dan checkout aman

Acceptance Criteria:
- schema database mencakup entitas utama commerce dan payment
- endpoint penting memiliki validasi input dan handling error konsisten
- webhook log tercatat untuk audit dan troubleshooting

### Story 12: QA, Content, and Launch Readiness
- review copy halaman utama
- cek responsivitas
- cek happy path login, cart, checkout, dan payment
- siapkan deployment checklist awal

Acceptance Criteria:
- test checklist MVP lulus pada flow utama
- copy halaman utama konsisten dengan positioning brand `Cravana`
- dokumen launch checklist tersedia dan bisa dipakai tim

## Referensi

- `../project-context.md`
- `requirements.md`
- `architecture.md`
- `product-brief.md`
