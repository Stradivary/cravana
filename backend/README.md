# Backend — Cravana API

Folder ini berisi backend API untuk proyek `Cravana`.

## Peran Backend

Backend bertanggung jawab untuk:
- autentikasi user,
- pengelolaan session,
- akses data Supabase,
- penyediaan data produk,
- pemrosesan cart dan checkout,
- integrasi pembayaran QRIS melalui Xendit,
- penerimaan webhook status pembayaran.

## Tech Stack

- Next.js
- TypeScript
- Supabase PostgreSQL
- helper JWT / cookie session

## Status Saat Ini

Base backend saat ini masih membawa fondasi auth dari proyek sebelumnya. Fondasi ini akan dipakai ulang untuk membangun API e-commerce `Cravana`.

## Planned API Domains

### Auth
- login Google / Gmail
- login nomor HP
- session check
- logout

### Products
- daftar produk
- detail produk

### Cart
- lihat cart
- tambah item
- ubah quantity
- hapus item

### Checkout & Orders
- submit checkout
- buat order
- lihat status order

### Payments
- buat transaksi QRIS Xendit
- terima webhook pembayaran
- sinkronisasi status payment dan order

Endpoint webhook yang digunakan saat ini:
- `POST /api/payments/xendit/webhook`

Set callback URL ini di dashboard Xendit (sesuaikan domain):
- `https://<your-domain>/api/payments/xendit/webhook`

Header callback token dari Xendit harus sama dengan env:
- `XENDIT_WEBHOOK_TOKEN`

### Payment Audit Log (baru)

Webhook Xendit sekarang menyimpan histori event ke tabel `payments` (processed/ignored/failed) untuk kebutuhan debug dan audit.

Jalankan migration SQL berikut di Supabase SQL Editor:
- `docs/migrations/2026-04-14_add_payments_table.sql`

Setelah migration aktif, endpoint webhook akan otomatis menulis `raw_payload`, `processing_result`, dan relasi `order_id` (jika ditemukan).

## Environment Variables

Buat `backend/.env.local`:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
JWT_SECRET_KEY=your-strong-secret
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3100
XENDIT_SECRET_KEY=your-xendit-secret-key
XENDIT_WEBHOOK_TOKEN=your-xendit-webhook-token
XENDIT_CALLBACK_URL=https://<your-domain>/api/payments/xendit/webhook
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

## Menjalankan Backend

```bash
cd backend
npm install
npm run dev
```

Server berjalan di `http://localhost:3100`.

## Catatan Implementasi

- Semua endpoint baru harus mengikuti konteks di `_bmad-output/project-context.md`.
- Integrasi payment harus memiliki validasi signature/token webhook.
- Semua perubahan domain model harus selaras dengan planning artifacts `Cravana`.