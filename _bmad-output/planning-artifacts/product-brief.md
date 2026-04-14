# Product Brief — Cravana

## 1) Executive Summary

`Cravana` adalah brand cookies F&B yang ingin menjual produk secara langsung melalui kanal digital. Produk inti fase awal:
- Cookies Original
- Cookies Whey
- Cookies Kurma

Proyek ini membangun website brand + e-commerce flow sederhana agar calon pembeli bisa:
1. mengenal brand,
2. melihat produk,
3. menaruh produk ke cart,
4. checkout,
5. membayar via QRIS (Xendit).

## 2) Problem Statement

Tanpa kanal digital yang terstruktur, konversi pembelian bergantung pada chat manual atau marketplace pihak ketiga sehingga:
- pengalaman brand tidak konsisten,
- alur pembelian panjang,
- data order dan pembayaran sulit dirapikan,
- sulit scale kampanye iklan ke alur checkout yang terukur.

## 3) Product Vision

Membuat pengalaman belanja cookies yang cepat, clean, dan terpercaya untuk mendorong pembelian berulang di kanal milik sendiri.

## 4) Target Segment

- Konsumen usia produktif yang terbiasa belanja online via HP.
- Audience yang mencari snack premium-accessible untuk konsumsi harian/hadiah.
- Pembeli impulsif dari iklan sosial media yang membutuhkan flow checkout ringkas.

## 5) Value Proposition

- Produk cookies dengan positioning modern dan rasa yang jelas diferensiasinya.
- Alur beli cepat (mobile-first) dari landing page ke checkout.
- Pembayaran QRIS yang familiar untuk user Indonesia.
- Login sederhana (Google / nomor HP) untuk mempercepat transaksi dan retensi.

## 6) Success Metrics (MVP)

Metrik awal yang dipantau setelah rilis:
- Landing-to-product CTR ≥ 20%
- Add-to-cart rate ≥ 8%
- Checkout completion rate ≥ 35% (dari user yang membuka cart)
- Payment success rate ≥ 90% (dari transaksi yang dibuat)
- Median waktu dari masuk website ke checkout submit ≤ 4 menit

## 7) MVP Scope

### In Scope
- Landing page
- Home page
- Product listing + product card
- Cart
- Checkout
- Login Google
- Login nomor HP (OTP flow)
- Pembayaran QRIS via Xendit
- Payment status / order confirmation

### Out of Scope (Fase Lanjutan)
- Promo engine kompleks
- Loyalty program
- Dashboard admin penuh
- Integrasi logistik multi-warehouse
- Personalization berbasis AI

## 8) UX Direction

Pendekatan UX:
- clean, minimal, fokus CTA,
- mobile-first,
- visual produk dominan,
- copy singkat dan jelas,
- friction seminimal mungkin di checkout.

Struktur landing yang direkomendasikan:
1. Hero + dual CTA (`Get Started` dan `Sign In`)
2. Digital Menu highlights (produk unggulan)
3. Order Flow highlights (cara pesan singkat)
4. Mobile First highlights (kecepatan dan kemudahan)
5. CTA repeat

## 9) Core Flows

### Flow A — Discover to Browse
Landing (`Get Started`) → Home/Menu → Product card interaction

### Flow A2 — Discover to Sign In
Landing/Home (`Sign In`) → Login → Session valid

### Flow B — Browse to Cart
Pilih produk → Tambah ke cart → Tinjau subtotal

### Flow C — Cart to Checkout
Cart → Form checkout → Submit order draft

### Flow D — Checkout to Paid
Generate QRIS Xendit → User bayar → webhook update status → payment confirmation

## 10) Risks & Mitigations

- Risiko: drop-off tinggi saat checkout
  - Mitigasi: form ringkas, field wajib minimal, validasi inline
- Risiko: status payment tidak sinkron
  - Mitigasi: webhook verification + retry-safe updates + webhook logs
- Risiko: visual brand belum kuat
  - Mitigasi: konsistensi style guide, foto produk, CTA hierarchy jelas

## 11) Dependencies

- Supabase project siap pakai
- Akun Xendit aktif untuk QRIS
- Kredensial auth provider (Google + provider OTP HP)
- Asset brand dasar (logo, foto produk, copy)

## 12) Implementation References

- `../project-context.md`
- `requirements.md`
- `architecture.md`
- `stories.md`