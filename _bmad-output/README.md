# BMAD Output Index — Cravana

Folder ini menjadi pusat artefak BMAD untuk proyek `Cravana`.

## Ringkasan Proyek

`Cravana` adalah proyek digital untuk brand cookies di bidang F&B dengan fokus pada:
- website brand,
- landing page promosi,
- katalog produk,
- cart dan checkout,
- login dengan Gmail dan nomor HP,
- pembayaran QRIS melalui Xendit.

Base code yang ada saat ini dipakai sebagai fondasi teknis, lalu diarahkan ulang ke kebutuhan bisnis `Cravana`.

## Flow Produk Acuan Saat Ini

Untuk fase implementasi saat ini, flow UX mengacu pada pola sederhana seperti referensi `pondongopi.biz.id`:
- Landing page minimal dengan 2 CTA utama: `Get Started` dan `Sign In`
- Section nilai utama: `Digital Menu`, `Order Flow`, `Mobile First`
- User masuk ke halaman menu/home untuk memilih produk
- User diarahkan ke autentikasi sebelum melanjutkan flow transaksi

Catatan:
- Konteks domain tetap `Cravana` (cookies/e-commerce)
- Flow ini dipakai sebagai baseline UX phase awal sebelum ekspansi checkout/payment penuh

## Struktur Folder

- `project-context.md`
  - konteks inti proyek dan aturan implementasi global.
- `planning-artifacts/`
  - dokumen requirement, arsitektur, dan story delivery.
- `implementation-artifacts/`
  - catatan asesmen base code, arah transformasi, dan milestone implementasi.

## Prinsip Penggunaan

- Semua workflow BMAD harus merujuk terlebih dahulu ke `project-context.md`.
- Planning artifacts harus selalu merefleksikan tujuan bisnis `Cravana`, bukan lagi dashboard auth generik.
- Implementation artifacts dipakai untuk mencatat apa yang sudah ada di base code dan apa yang perlu diubah agar sesuai dengan product vision baru.

## Status Saat Ini

- konteks proyek sudah diubah ke domain F&B / cookies brand,
- planning artifacts sedang diarahkan ulang ke alur e-commerce,
- README proyek dan aplikasi sedang diselaraskan dengan visi `Cravana`.
