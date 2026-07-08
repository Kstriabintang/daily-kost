# 🏠 Daily Kost

Aplikasi web manajemen **kos dengan sewa harian**. Kelola kamar, booking check-in/check-out, penghuni, dan keuangan — semua dari satu dashboard yang ringan dan responsif.

Dibuat dengan **Vue 3 + Vite + Tailwind CSS v4**, state pakai **Pinia** dan otomatis tersimpan di `localStorage` (jalan tanpa backend).

## Fitur

- **Dashboard** — okupansi, pendapatan harian, kamar kosong, tagihan tertunggak, dan jadwal check-out terdekat.
- **Kamar** — CRUD kamar (nomor, tipe, tarif harian, fasilitas) dengan status kosong/terisi otomatis dari booking aktif.
- **Booking** — booking baru dengan pilih kamar kosong, hitung jumlah malam & total biaya secara live, check-out, tandai lunas, dan riwayat.
- **Penghuni** — daftar penghuni unik dengan jumlah menginap & total belanja.
- **Keuangan** — ringkasan pemasukan, tunggakan, tabel transaksi, dan export CSV.

## Menjalankan

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # build produksi ke dist/
pnpm preview    # preview hasil build
```

## Struktur

```
src/
├── App.vue              # layout: sidebar (desktop) + bottom nav (mobile)
├── router/              # Vue Router — 5 halaman
├── stores/kost.js       # Pinia store + seed data + persist localStorage
├── views/               # Dashboard, Rooms, Bookings, Tenants, Finance
├── components/          # StatCard, ModalDialog
└── utils/format.js      # format Rupiah & tanggal (id-ID)
```

## Catatan

Data demo tersimpan lokal di browser. Untuk reset ke data awal, panggil `resetData()` dari store atau hapus key `daily-kost-v1` di localStorage.
