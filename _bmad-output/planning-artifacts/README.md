# Planning Artifacts — Cravana

Folder ini berisi artefak perencanaan untuk proyek `Cravana`.

## Isi Folder

- `product-brief.md`
	- ringkasan strategi produk, positioning, target user, scope MVP, dan KPI awal.
- `requirements.md`
	- kebutuhan bisnis dan produk fase awal.
- `architecture.md`
	- arsitektur solusi tingkat tinggi untuk frontend, backend, database, auth, dan payment.
- `stories.md`
	- urutan story implementasi agar base code dapat diubah menjadi platform e-commerce cookies.

## Tujuan

Dokumen di folder ini dipakai untuk menyamakan persepsi antara product direction, desain UX, dan implementasi teknis.

Semua isi folder ini harus mengacu ke:
- `../project-context.md`

Fokus planning saat ini adalah membangun fondasi `Cravana` sebagai website + commerce flow yang siap diintegrasikan dengan QRIS Xendit.

## Baseline Flow yang Dipakai

Seluruh planning pada fase aktif mengacu pada flow:
- landing minimal dengan CTA `Get Started` + `Sign In`,
- halaman home/menu untuk eksplor produk,
- mobile-first interaction,
- login sebagai pintu masuk sebelum checkout flow penuh.
