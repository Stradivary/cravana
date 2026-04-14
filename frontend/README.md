# Frontend — Cravana Web

Folder ini berisi frontend utama untuk proyek `Cravana`.

## Tujuan Frontend

Frontend akan menjadi wajah digital brand `Cravana`, mencakup:
- landing page,
- home,
- product listing,
- product card,
- cart,
- checkout,
- login user,
- payment status page.

## Tech Stack

- React
- TypeScript
- React Router
- React Hook Form
- Zod
- TanStack Query
- TailwindCSS

## Arah UX

Frontend diarahkan untuk pengalaman yang:
- clean,
- modern,
- mobile-first,
- cepat dipahami,
- fokus pada konversi pembelian.

Pendekatan layout yang diinginkan:
- hero section yang kuat,
- CTA jelas,
- value highlights,
- featured products,
- flow belanja yang ringkas.

## Status Saat Ini

Base frontend yang tersedia saat ini masih bertumpu pada flow auth dan dashboard dari proyek sebelumnya. Fondasi ini akan di-refactor menjadi aplikasi e-commerce cookies `Cravana`.

## Planned Routes

- `/`
- `/products`
- `/cart`
- `/checkout`
- `/login`
- `/payment-status`

## Environment Variables

Buat `frontend/.env`:

```env
REACT_APP_API_URL=http://localhost:3100
REACT_APP_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
REACT_APP_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

## Menjalankan Frontend

```bash
cd frontend
npm install
npm start
```

App berjalan di `http://localhost:3000`.

## Build

```bash
cd frontend
npm run build
```

## Catatan

- Semua copy, visual, dan struktur halaman harus mengikuti konteks `Cravana`.
- Integrasi API harus mengacu ke backend commerce flow, bukan lagi dashboard users management.
- Gunakan komponen reusable untuk section marketing dan product commerce agar implementasi cepat berkembang.
