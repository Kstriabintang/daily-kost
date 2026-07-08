import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'landing', component: () => import('../views/LandingView.vue'), meta: { title: 'Manajemen Kos Harian Premium se-Pontianak' } },
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
  scrollBehavior: () => ({ top: 0 }),
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'Daily Kost'} · Daily Kost Pontianak`
})

export default router
