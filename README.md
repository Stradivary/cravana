# Cravana

`Cravana` adalah proyek digital untuk brand cookies di bidang F&B. Repository ini memakai base code BMAD multi-app untuk dikembangkan menjadi:
- website brand,
- landing page promosi,
- katalog produk,
- cart dan checkout,
- autentikasi user,
- pembayaran QRIS melalui Xendit.

Produk utama yang menjadi fokus awal:
- Cookies Original
- Cookies Whey
- Cookies Kurma

## Arah Proyek

Base code awal repository ini sebelumnya berangkat dari fondasi auth/dashboard. Sekarang repositori ini diarahkan ulang menjadi platform e-commerce ringan untuk `Cravana`.

Artinya:
- struktur teknis tetap dimanfaatkan,
- narasi produk berubah total ke domain F&B,
- seluruh artefak BMAD di `_bmad-output` menjadi sumber konteks baru untuk implementasi berikutnya.

## Ruang Lingkup MVP

Fitur yang menjadi target fase awal:
- landing page / home,
- product listing,
- product card,
- cart,
- checkout,
- login dengan Gmail,
- login dengan nomor HP,
- pembayaran QRIS via Xendit,
- order confirmation / payment status.

## Arah Desain

Website diarahkan memiliki pengalaman yang:
- clean,
- minimal,
- mobile-first,
- conversion-oriented,
- cocok untuk brand makanan modern.

Sebagai referensi gaya, proyek ini mengambil inspirasi dari pendekatan landing page yang ringkas, rapi, dan fokus CTA seperti sample yang diberikan pengguna.

## Struktur Repository

- `frontend/`
	- aplikasi React untuk website brand dan commerce flow.
- `backend/`
	- aplikasi Next.js API untuk auth, products, checkout, dan payment integration.
- `_bmad/`
	- framework, agents, workflow, dan konfigurasi BMAD.
- `_bmad-output/`
	- project context, planning artifacts, dan implementation artifacts untuk `Cravana`.
- `docs/`
	- dokumentasi pendukung tambahan.

## Project Context BMAD

Dokumen inti yang harus dibaca sebelum melanjutkan planning atau implementasi:
- `_bmad-output/project-context.md`

Dokumen perencanaan terkait:
- `_bmad-output/planning-artifacts/product-brief.md`
- `_bmad-output/planning-artifacts/requirements.md`
- `_bmad-output/planning-artifacts/architecture.md`
- `_bmad-output/planning-artifacts/stories.md`

## Teknologi Saat Ini

### Frontend
- React
- TypeScript
- React Router
- React Hook Form
- Zod
- TanStack Query
- TailwindCSS

### Backend
- Next.js
- TypeScript
- Supabase
- JWT / cookie helper

### Integrasi Target
- Google sign-in
- login / verifikasi nomor HP
- Xendit QRIS payment

## Setup Environment

### 1. Backend

Buat file `backend/.env.local`:

```env
SUPABASE_URL=https://YOUR_PROJECT.supabase.co
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY
JWT_SECRET_KEY=your-strong-secret
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:3100

# payment
XENDIT_SECRET_KEY=your-xendit-secret-key
XENDIT_WEBHOOK_TOKEN=your-xendit-webhook-token

# auth providers (sesuaikan saat implementasi)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
```

### 2. Frontend

Buat file `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:3100
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Instalasi

```bash
cd backend
npm install

cd ../frontend
npm install
```

## Menjalankan Secara Lokal

Gunakan dua terminal.

### Backend

```bash
cd backend
npm run dev
```

Backend berjalan pada `http://localhost:3100`.

### Frontend

```bash
cd frontend
npm start
```

Frontend berjalan pada `http://localhost:3000`.

## Status Implementasi Saat Ini

Saat ini repository masih berada pada fase transisi dari base code lama menuju `Cravana`.

Yang sudah tersedia sebagai fondasi:
- struktur frontend dan backend,
- auth/service patterns,
- koneksi Supabase,
- utilitas validasi dan data fetching.

Yang akan menjadi fokus implementasi berikutnya:
- halaman publik brand,
- data produk cookies,
- cart dan checkout,
- payment QRIS Xendit,
- flow login final untuk user `Cravana`.

## Catatan

- Jika planning berubah, perbarui dulu isi `_bmad-output` sebelum mengubah implementasi.
- Dokumentasi di repo ini sudah diarahkan ke konteks `Cravana`, meskipun sebagian source code masih akan direfactor pada tahap berikutnya.
