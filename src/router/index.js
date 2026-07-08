import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  { path: '/', name: 'dashboard', component: () => import('../views/DashboardView.vue'), meta: { title: 'Dashboard' } },
  { path: '/kamar', name: 'rooms', component: () => import('../views/RoomsView.vue'), meta: { title: 'Kamar' } },
  { path: '/booking', name: 'bookings', component: () => import('../views/BookingsView.vue'), meta: { title: 'Booking' } },
  { path: '/penghuni', name: 'tenants', component: () => import('../views/TenantsView.vue'), meta: { title: 'Penghuni' } },
  { path: '/keuangan', name: 'finance', component: () => import('../views/FinanceView.vue'), meta: { title: 'Keuangan' } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.afterEach((to) => {
  document.title = `${to.meta.title ?? 'Daily Kost'} — Daily Kost`
})

export default router
