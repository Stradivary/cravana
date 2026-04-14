# Asesmen Fondasi Frontend untuk Cravana

## Tujuan Dokumen

Dokumen ini menjelaskan fondasi frontend yang sudah ada pada base code dan bagaimana fondasi tersebut dapat dipakai ulang untuk proyek `Cravana`.

## Kondisi Saat Ini

Frontend saat ini masih berorientasi pada:
- login,
- register,
- route guard sederhana,
- dashboard setelah autentikasi.

Fondasi teknis yang sudah berguna untuk `Cravana`:
- React + TypeScript,
- React Router,
- React Hook Form,
- Zod,
- TanStack Query,
- struktur folder komponen dan page yang sudah bisa dikembangkan.

## Reuse Opportunity

Bagian yang dapat dipertahankan atau disesuaikan:
- infrastruktur routing,
- utility auth-session,
- pola form validation,
- service layer untuk komunikasi API,
- styling foundation dengan TailwindCSS.

## Perubahan yang Dibutuhkan

Untuk menjadi frontend `Cravana`, aplikasi perlu diubah dari dashboard-oriented menjadi commerce-oriented:
- route utama harus diarahkan ke home / landing page,
- landing harus memuat dual CTA `Get Started` dan `Sign In`,
- landing mengikuti pola section `Digital Menu`, `Order Flow`, `Mobile First`,
- route `dashboard` tidak lagi menjadi default user destination,
- perlu halaman baru untuk product list, cart, checkout, dan payment status,
- copywriting dan visual identity harus diganti ke brand cookies,
- komponen reusable untuk product card dan CTA perlu dibuat.

## Arah UI yang Disarankan

- clean dan minimal,
- visual produk lebih dominan,
- CTA jelas dan cepat terlihat,
- mobile-first,
- tone modern, hangat, dan cocok untuk F&B.

## Outcome yang Diharapkan

Setelah refactor awal, frontend akan menjadi shell yang siap menerima:
- landing page,
- katalog produk,
- cart,
- checkout,
- login Google dan nomor HP,
- halaman status pembayaran.

## Referensi

- `../project-context.md`
- `../planning-artifacts/stories.md`

