# Asesmen Base Code Fullstack & Arah Migrasi ke Commerce

## Ringkasan

Base code saat ini menyediakan fondasi fullstack berupa:
- frontend auth flow,
- backend auth dan users API,
- integrasi Supabase,
- pola pemisahan concern frontend dan backend.

Fondasi tersebut berguna, tetapi domain bisnisnya perlu diganti total menjadi e-commerce cookies untuk `Cravana`.

## Aset yang Sudah Bernilai

### Frontend
- pola route protection,
- service layer untuk API,
- struktur halaman auth,
- utility state/session sederhana.

### Backend
- struktur Next.js API project,
- utilitas CORS,
- helper JWT,
- helper koneksi Supabase,
- pola endpoint yang sudah bisa diperluas.

## Gap terhadap Kebutuhan Cravana

Base code lama belum memiliki:
- product domain,
- cart domain,
- checkout process,
- order management,
- payment integration Xendit,
- halaman publik brand dan katalog.

## Konsekuensi Migrasi

Migrasi ke `Cravana` berarti:
- dashboard users management bukan lagi fokus utama produk,
- API `users` hanya tersisa jika memang masih dibutuhkan untuk internal atau profile management,
- prioritas backend bergeser ke `products`, `cart`, `checkout`, `orders`, dan `payments`.

## Arah Pengembangan Backend

Backend perlu berkembang menjadi layanan yang menangani:
- entry flow autentikasi dari CTA `Sign In` di landing/home,
- login Google,
- login nomor HP,
- penyimpanan profil pelanggan,
- sinkronisasi cart dan order,
- pembuatan transaksi QRIS melalui Xendit,
- webhook payment status.

## Arah Data Model

Fokus schema baru:
- user dan profile,
- product dan category,
- cart dan cart item,
- order dan order item,
- payment dan webhook log.

## Catatan Strategis

Karena base code auth sudah tersedia, transformasi terbaik adalah:
1. pertahankan fondasi teknis,
2. hentikan ketergantungan pada narasi dashboard lama,
3. tambahkan domain commerce secara bertahap,
4. letakkan payment flow sebagai capability inti MVP.

## Referensi

- `../project-context.md`
- `../planning-artifacts/requirements.md`
- `../planning-artifacts/architecture.md`
