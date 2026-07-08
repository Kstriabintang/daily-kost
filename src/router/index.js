import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    component: () => import('../layouts/PublicLayout.vue'),
    children: [
      { path: '', name: 'home', component: () => import('../views/public/HomeView.vue'), meta: { title: 'Sewa Kos Harian Premium se-Pontianak' } },
      { path: 'cari', name: 'search', component: () => import('../views/public/SearchView.vue'), meta: { title: 'Cari Kamar Kos' } },
      { path: 'kamar/:id', name: 'room', component: () => import('../views/public/RoomDetailView.vue'), meta: { title: 'Detail Kamar' } },
      { path: 'pesan/:id', name: 'book', component: () => import('../views/public/GuestBookingView.vue'), meta: { title: 'Pesan Kamar' } },
      { path: 'booking/sukses', name: 'success', component: () => import('../views/public/SuccessView.vue'), meta: { title: 'Pemesanan Berhasil' } },
    ],
  },
  {
    path: '/app',
    component: () => import('../layouts/DashboardLayout.vue'),
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

router.afterEach((to) => {
  const isPublic = !to.path.startsWith('/app')
  document.title = isPublic
    ? `${to.meta.title ?? 'Daily Kost'} · Daily Kost Pontianak`
    : `${to.meta.title ?? 'Dashboard'} · Daily Kost Admin`
})

export default router
