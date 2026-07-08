# 🌿 Daily Kost Pontianak — Manajemen Kos Premium

Platform manajemen **kos harian se-Pontianak** yang mewah dan profesional. Multi-properti, dashboard analitik, dan pusat WhatsApp untuk broadcast & pesan penghuni — dalam satu sistem terpadu bertema **Emerald Luxe** (hijau tua + putih + aksen emas, ala Starbucks).

Dibangun dengan **Vue 3 + Vite + Tailwind CSS v4**, state via **Pinia** dengan persist `localStorage` (jalan tanpa backend). SEO-ready (meta, Open Graph, JSON-LD, sitemap, robots).

## Modul (10)

| Grup | Modul | Isi |
|---|---|---|
| Operasional | **Dashboard** | KPI + tren pendapatan (area chart), komposisi kamar (donut), okupansi per cabang (bar), check-out terdekat, transaksi terbaru |
| | **Properti** | 5 cabang kos di area Pontianak, cover gradient, rating, okupansi, CRUD |
| | **Kamar** | Per properti, filter status, tarif harian/bulanan, fasilitas, CRUD |
| | **Booking** | Reservasi dengan hitung malam & total live, sumber booking, check-out, riwayat |
| | **Penghuni** | Profil penghuni, riwayat menginap, total belanja, quick WA |
| Keuangan | **Pembayaran** | Invoice, filter metode (Transfer/QRIS/Tunai), export CSV |
| | **Keuangan** | Laba rugi, arus pendapatan, pengeluaran per kategori, catat biaya |
| | **Laporan** | Analitik okupansi, sumber booking, kamar terlaba |
| Komunikasi | **WhatsApp Center** | Broadcast channel + pesan personal, template dengan variabel, riwayat, status API |
| Sistem | **Pengaturan** | Profil bisnis, **integrasi WhatsApp API** (Meta Cloud/Twilio/Fonnte/Wablas), tema, reset data |

## Menjalankan

```bash
pnpm install
pnpm dev        # http://localhost:5173
pnpm build      # produksi → dist/
pnpm preview
```

## Struktur

```
src/
├── App.vue                  # sidebar hijau + property switcher + topbar
├── router/                  # 10 rute lazy-loaded
├── stores/kost.js           # Pinia: properti, kamar, penghuni, booking,
│                            #   pembayaran, pengeluaran, broadcast + analytics
├── views/                   # 10 modul halaman
├── components/
│   ├── Icon.vue             # ikon SVG (Lucide-style)
│   ├── StatCard, ModalDialog, PageHeader, Avatar
│   └── charts/              # AreaChart, BarChart, DonutChart (SVG, tanpa dependency)
└── utils/format.js          # rupiah, tanggal, relatif (id-ID)
```

## Integrasi WhatsApp API (langkah berikutnya)

UI di **WhatsApp Center** & **Pengaturan** sudah siap. Untuk mengaktifkan pengiriman nyata:
1. Isi kredensial di Pengaturan → Integrasi WhatsApp API (provider, Phone Number ID, Access Token).
2. Ganti `sendBroadcast()` di `stores/kost.js` agar memanggil endpoint provider (mis. Meta Cloud API `/messages`).
3. Pasang webhook (`/webhook/wa`) untuk status pengiriman & pesan masuk.

Tema warna: hijau tua `#1e3932` / `#00704a`, aksen emas `#c8a15a`, krem `#faf9f5`.
