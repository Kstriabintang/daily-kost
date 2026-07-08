import { createRouter, createWebHistory } from 'vue-router'

const SITE = 'https://kostpontianak.web.id'
const BRAND = 'Daily Kost Pontianak'
const DEFAULT_DESC = 'Sewa kamar kos singgah & transit di Pontianak per 3 jam, 6 jam, 12 jam, atau harian. AC, Smart TV + Netflix, kamar mandi dalam, bersih & nyaman. Pesan tanpa login.'

const routes = [
  {
    path: '/',
    component: () => import('../layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('../views/public/HomeView.vue'), meta: { title: 'Sewa Kamar Kos Singgah & Transit Per Jam di Pontianak', desc: DEFAULT_DESC } },
      { path: 'cari', name: 'search', component: () => import('../views/public/SearchView.vue'), meta: { title: 'Cari Kamar Singgah — Sewa Per Jam & Harian', desc: 'Cari & bandingkan kamar kos singgah di seluruh Pontianak. Filter area, kelas kamar, dan durasi 3–24 jam. Semua kamar AC, Netflix, kamar mandi dalam.' } },
      { path: 'kamar/:id', name: 'room', component: () => import('../views/public/RoomDetailView.vue'), meta: { title: 'Detail Kamar Singgah', desc: 'Lihat foto, fasilitas, dan harga per durasi kamar singgah ini. AC, Smart TV, Netflix, WiFi cepat, kamar mandi dalam. Pesan langsung tanpa login.' } },
      { path: 'pesan/:id', name: 'book', component: () => import('../views/public/GuestBookingView.vue'), meta: { title: 'Pesan Kamar Singgah', desc: 'Pesan kamar singgah sebagai tamu — cukup nama & nomor HP. Pilih durasi, jam masuk, dan bayar di tempat.' } },
      { path: 'booking/sukses', name: 'success', component: () => import('../views/public/SuccessView.vue'), meta: { title: 'Pemesanan Berhasil', noindex: true } },
    ],
  },
  {
    path: '/app',
    component: () => import('../layouts/DashboardLayout.vue'),
    meta: { admin: true },
    children: [
      { path: '', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { title: 'Dashboard' } },
      { path: 'properti', name: 'properties', component: () => import('../views/PropertiesView.vue'), meta: { title: 'Properti' } },
      { path: 'kamar', name: 'rooms', component: () => import('../views/RoomsView.vue'), meta: { title: 'Kamar' } },
      { path: 'booking', name: 'bookings', component: () => import('../views/BookingsView.vue'), meta: { title: 'Booking' } },
      { path: 'penghuni', name: 'tenants', component: () => import('../views/TenantsView.vue'), meta: { title: 'Penghuni' } },
      { path: 'pembayaran', name: 'payments', component: () => import('../views/PaymentsView.vue'), meta: { title: 'Pembayaran' } },
      { path: 'keuangan', name: 'finance', component: () => import('../views/FinanceView.vue'), meta: { title: 'Keuangan' } },
      { path: 'laporan', name: 'reports', component: () => import('../views/ReportsView.vue'), meta: { title: 'Laporan' } },
      { path: 'whatsapp', name: 'whatsapp', component: () => import('../views/WhatsAppView.vue'), meta: { title: 'WhatsApp' } },
      { path: 'pengaturan', name: 'settings', component: () => import('../views/SettingsView.vue'), meta: { title: 'Pengaturan' } },
    ],
  },
  { path: '/:pathMatch(.*)*', redirect: '/' },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) return savedPosition
    return { top: 0 }
  },
})

// ── SEO helper: satu tempat untuk atur title/description/canonical per halaman ──
function upsertMeta(attr, key, content) {
  let el = document.head.querySelector(`meta[${attr}="${key}"]`)
  if (!el) { el = document.createElement('meta'); el.setAttribute(attr, key); document.head.appendChild(el) }
  el.setAttribute('content', content)
}
function upsertLink(rel, href) {
  let el = document.head.querySelector(`link[rel="${rel}"]`)
  if (!el) { el = document.createElement('link'); el.setAttribute('rel', rel); document.head.appendChild(el) }
  el.setAttribute('href', href)
}

router.afterEach((to) => {
  const admin = to.path.startsWith('/app')
  const title = admin
    ? `${to.meta.title ?? 'Dashboard'} · ${BRAND} Admin`
    : `${to.meta.title ?? BRAND} · ${BRAND}`
  document.title = title

  const desc = to.meta.desc || DEFAULT_DESC
  const url = SITE + (to.path === '/' ? '/' : to.path)

  upsertMeta('name', 'description', desc)
  upsertMeta('property', 'og:title', title)
  upsertMeta('property', 'og:description', desc)
  upsertMeta('property', 'og:url', url)
  upsertMeta('name', 'twitter:title', title)
  upsertMeta('name', 'twitter:description', desc)
  // Admin & halaman transaksional tidak diindeks; halaman publik diindeks
  upsertMeta('name', 'robots', admin || to.meta.noindex ? 'noindex, nofollow' : 'index, follow')
  upsertLink('canonical', url)
})

export default router
