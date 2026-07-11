<div align="center">

# 🌿 Daily Kost

### Platform kos singgah & transit — sewa per jam sampai harian

Butuh tempat singgah sebentar? **Daily Kost** menghubungkan tamu dengan kamar kos
transit yang bisa disewa **per 3 / 6 / 12 jam atau harian** — pesan tanpa login,
plus panel pemilik lengkap untuk mengelola seluruh operasional bisnis.

<br />

[![Live](https://img.shields.io/badge/Live-kostpontianak.web.id-00704a?style=for-the-badge&logo=cloudflare&logoColor=white)](https://kostpontianak.web.id)
&nbsp;
[![Panel Pemilik](https://img.shields.io/badge/Panel_Pemilik-%2Fapp-c9a45c?style=for-the-badge&logo=vuedotjs&logoColor=white)](https://kostpontianak.web.id/app)

<br />

![Vue](https://img.shields.io/badge/Vue_3-42b883?style=flat-square&logo=vuedotjs&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-646CFF?style=flat-square&logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_v4-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Pinia](https://img.shields.io/badge/Pinia-FFD859?style=flat-square&logo=vuedotjs&logoColor=black)
![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?style=flat-square&logo=supabase&logoColor=white)
![Cloudflare Pages](https://img.shields.io/badge/Cloudflare_Pages-F38020?style=flat-square&logo=cloudflarepages&logoColor=white)

</div>

<br />

<div align="center">
  <img src="docs/screenshots/web-landing.png" alt="Halaman utama Daily Kost" width="100%" />
</div>

<br />

## ✨ Sorotan

Satu aplikasi, dua sisi yang saling terhubung:

<table>
<tr>
<td width="50%" valign="top">

### 🧳 Sisi Tamu

- **Sewa fleksibel** — durasi 3, 6, 12 jam, atau harian dengan perhitungan otomatis
- **Pesan tanpa login** — cukup nama & nomor HP, bayar di tempat
- **Cari & filter** — area, kelas kamar, harga maksimal, urutkan rekomendasi
- **Detail kamar** — foto, fasilitas (AC, Smart TV + Netflix, WiFi, kamar mandi dalam), harga per durasi
- **Dark mode** elegan & tampilan mobile-first

</td>
<td width="50%" valign="top">

### 🛠️ Panel Pemilik `/app`

- **Dashboard** — okupansi, pendapatan, tunggakan, tren & komposisi kamar
- **Multi-properti** — kelola beberapa cabang dari satu tempat
- **Kamar & Booking** — CRUD, status, check-in/out, riwayat
- **Penghuni** — profil, riwayat menginap, quick WhatsApp
- **Keuangan** — pembayaran, laba/rugi, pengeluaran, laporan & ekspor
- **WhatsApp Center** — broadcast & pesan personal ber-template

</td>
</tr>
</table>

<br />

## 📸 Tampilan

**Panel pemilik — Dashboard**

<div align="center">
  <img src="docs/screenshots/web-panel.png" alt="Dashboard panel pemilik" width="100%" />
</div>

<br />

**Pencarian kamar**

<div align="center">
  <img src="docs/screenshots/web-search.png" alt="Halaman pencarian kamar" width="100%" />
</div>

<br />

**Tampilan mobile**

<div align="center">
<table>
<tr>
<td align="center"><b>Beranda</b><br/><img src="docs/screenshots/mobile-landing.png" alt="Beranda mobile" width="270" /></td>
<td align="center"><b>Dashboard</b><br/><img src="docs/screenshots/mobile-panel.png" alt="Dashboard mobile" width="270" /></td>
</tr>
</table>
</div>

<br />

## 🧩 Teknologi

| Lapisan | Teknologi |
|---|---|
| **Frontend** | Vue 3 (Composition API, `<script setup>`), Vue Router |
| **Build** | Vite 6 |
| **Styling** | Tailwind CSS v4 (`@theme`), design system Emerald Luxe (hijau/emas), dark mode |
| **State** | Pinia |
| **Data** | Supabase (PostgreSQL) — publishable key, aman untuk sisi klien |
| **Grafik** | SVG kustom (Area / Bar / Donut) — tanpa dependency chart |
| **Deploy** | Cloudflare Pages |
| **SEO** | Meta dinamis, Open Graph, canonical, `noindex` untuk panel & halaman transaksi |

<br />

## 🚀 Menjalankan

```bash
# 1. Install dependency
pnpm install

# 2. Mode pengembangan
pnpm dev          # http://localhost:5173

# 3. Build produksi
pnpm build        # output → dist/
pnpm preview      # pratinjau hasil build
```

> Rute publik ada di `/`, panel pemilik di **`/app`**.

### Konfigurasi (opsional)

Aplikasi jalan dengan Supabase default. Untuk memakai project Supabase-mu sendiri,
buat `.env`:

```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_KEY=sb_publishable_xxxxxxxx
```

<br />

## 🗂️ Struktur Proyek

```
src/
├── main.js                  # bootstrap + directive v-reveal
├── router/index.js          # rute publik & panel (lazy-loaded) + SEO meta
├── layouts/
│   ├── PublicLayout.vue     # navbar + footer situs publik
│   └── DashboardLayout.vue  # sidebar + topbar panel pemilik
├── views/
│   ├── public/              # Home, Search, RoomDetail, GuestBooking, Success
│   └── ...                  # Dashboard, Properties, Rooms, Bookings, Tenants,
│                            #   Payments, Finance, Reports, WhatsApp, Settings
├── components/
│   ├── public/              # Navbar, SearchBar, RoomCard, Footer, dll
│   └── charts/              # AreaChart, BarChart, DonutChart (SVG murni)
├── stores/kost.js           # Pinia: properti, kamar, booking, penghuni, keuangan
├── lib/supabase.js          # klien + helper CRUD
└── style.css                # design system (token warna, font, animasi)
```

<br />

## ☁️ Deploy (Cloudflare Pages)

| Pengaturan | Nilai |
|---|---|
| Build command | `pnpm build` |
| Output directory | `dist` |
| Domain | `kostpontianak.web.id` |

<br />

## 👤 Pembuat

**Ksatria Bintang Samudra** · AI Engineer

[![GitHub](https://img.shields.io/badge/GitHub-Kstriabintang-181717?style=flat-square&logo=github)](https://github.com/Kstriabintang)
[![LinkedIn](https://img.shields.io/badge/LinkedIn-Ksatria_Bintang_Samudra-0A66C2?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/ksatria-bintang-samudra-265952313)
[![Website](https://img.shields.io/badge/Website-ksatriabintangsamudra.my.id-00704a?style=flat-square&logo=googlechrome&logoColor=white)](https://ksatriabintangsamudra.my.id)

<div align="center">
<br />
<sub>Dibuat dengan 🌿 menggunakan Vue & Tailwind</sub>
</div>
