<script setup>
import { ref, computed } from 'vue'
import { RouterView, RouterLink, useRoute } from 'vue-router'
import { useKostStore } from '../stores/kost'
import Icon from '../components/Icon.vue'

const store = useKostStore()
const route = useRoute()

const navGroups = [
  {
    label: 'Operasional',
    items: [
      { to: '/app', label: 'Dashboard', icon: 'dashboard', exact: true },
      { to: '/app/properti', label: 'Properti', icon: 'building' },
      { to: '/app/kamar', label: 'Kamar', icon: 'door' },
      { to: '/app/booking', label: 'Booking', icon: 'calendar' },
      { to: '/app/penghuni', label: 'Penghuni', icon: 'users' },
    ],
  },
  {
    label: 'Keuangan',
    items: [
      { to: '/app/pembayaran', label: 'Pembayaran', icon: 'receipt' },
      { to: '/app/keuangan', label: 'Keuangan', icon: 'wallet' },
      { to: '/app/laporan', label: 'Laporan', icon: 'chart' },
    ],
  },
  { label: 'Komunikasi', items: [{ to: '/app/whatsapp', label: 'WhatsApp', icon: 'message', badge: 'API' }] },
  { label: 'Sistem', items: [{ to: '/app/pengaturan', label: 'Pengaturan', icon: 'settings' }] },
]

const sidebarOpen = ref(false)
const switcherOpen = ref(false)
const search = ref('')

const activeProperty = computed(() => (store.activePropertyId ? store.propertyById(store.activePropertyId) : null))
function selectProperty(id) {
  store.activePropertyId = id
  switcherOpen.value = false
}
function isActive(item) {
  return item.exact ? route.path === item.to : route.path.startsWith(item.to)
}
const mobileNav = computed(() => [navGroups[0].items[0], navGroups[0].items[1], navGroups[0].items[3], navGroups[1].items[1], navGroups[2].items[0]])

const today = new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
</script>

<template>
  <div class="min-h-screen lg:flex">
    <div v-if="sidebarOpen" class="fixed inset-0 z-40 bg-brand-950/40 lg:hidden" @click="sidebarOpen = false" />

    <!-- Sidebar -->
    <aside class="fixed inset-y-0 left-0 z-50 flex w-72 flex-col bg-brand-700 text-brand-100 transition-transform lg:static lg:translate-x-0" :class="sidebarOpen ? 'translate-x-0' : '-translate-x-full'">
      <RouterLink to="/" class="flex items-center gap-3 px-6 py-6">
        <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-brand-600 text-lg shadow-lg ring-1 ring-white/10"><Icon name="home" :size="22" class="text-white" /></span>
        <div>
          <p class="font-display text-lg leading-tight font-bold text-white">Daily Kost</p>
          <p class="text-[11px] tracking-wide text-brand-300">PONTIANAK · PREMIUM</p>
        </div>
      </RouterLink>

      <!-- Property switcher -->
      <div class="relative px-4">
        <button class="flex w-full items-center gap-3 rounded-xl bg-brand-800/60 px-3 py-2.5 text-left ring-1 ring-white/5 transition hover:bg-brand-800" @click="switcherOpen = !switcherOpen">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-500/90 text-brand-900"><Icon name="building" :size="16" /></span>
          <span class="min-w-0 flex-1">
            <span class="block truncate text-sm font-semibold text-white">{{ activeProperty ? activeProperty.name : 'Semua Properti' }}</span>
            <span class="block truncate text-[11px] text-brand-300">{{ activeProperty ? activeProperty.area : `${store.properties.length} cabang aktif` }}</span>
          </span>
          <Icon name="chevronsUpDown" :size="15" class="text-brand-300" />
        </button>
        <Transition enter-active-class="transition duration-150" enter-from-class="opacity-0 -translate-y-1" leave-active-class="transition duration-100" leave-to-class="opacity-0">
          <div v-if="switcherOpen" class="absolute inset-x-4 z-20 mt-2 overflow-hidden rounded-xl bg-white py-1.5 text-brand-800 shadow-2xl">
            <button class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-brand-50" :class="!store.activePropertyId && 'font-semibold text-brand-600'" @click="selectProperty(null)"><Icon name="dashboard" :size="15" /> Semua Properti</button>
            <div class="my-1 h-px bg-brand-50" />
            <button v-for="p in store.properties" :key="p.id" class="flex w-full items-center gap-2 px-3 py-2 text-sm hover:bg-brand-50" :class="store.activePropertyId === p.id && 'font-semibold text-brand-600'" @click="selectProperty(p.id)">
              <span class="h-2 w-2 rounded-full" :style="{ background: `hsl(${p.hue} 50% 40%)` }" />
              <span class="flex-1 truncate text-left">{{ p.name }}</span>
              <span class="text-[10px] text-brand-300">{{ p.area.replace('Pontianak ', '') }}</span>
            </button>
          </div>
        </Transition>
      </div>

      <nav class="mt-4 flex-1 space-y-5 overflow-y-auto px-4 pb-4">
        <div v-for="group in navGroups" :key="group.label">
          <p class="px-3 pb-1.5 text-[10px] font-semibold tracking-widest text-brand-300/70 uppercase">{{ group.label }}</p>
          <div class="space-y-0.5">
            <RouterLink v-for="item in group.items" :key="item.to" :to="item.to"
              class="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition"
              :class="isActive(item) ? 'bg-brand-600 text-white shadow-lg' : 'text-brand-100/80 hover:bg-brand-800/70 hover:text-white'"
              @click="sidebarOpen = false">
              <Icon :name="item.icon" :size="18" /><span class="flex-1">{{ item.label }}</span>
              <span v-if="item.badge" class="rounded-md bg-gold-500 px-1.5 py-0.5 text-[9px] font-bold tracking-wide text-brand-900">{{ item.badge }}</span>
            </RouterLink>
          </div>
        </div>
      </nav>

      <div class="border-t border-white/5 px-5 py-4">
        <div class="flex items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-brand-600 text-sm font-bold text-white">A</span>
          <div class="min-w-0 flex-1"><p class="truncate text-sm font-medium text-white">{{ store.settings.ownerName }}</p><p class="truncate text-[11px] text-brand-300">Owner</p></div>
          <RouterLink to="/" class="text-brand-300 hover:text-white"><Icon name="logout" :size="17" /></RouterLink>
        </div>
      </div>
    </aside>

    <!-- Main -->
    <div class="flex min-w-0 flex-1 flex-col">
      <header class="sticky top-0 z-30 flex items-center gap-3 border-b border-brand-700/5 bg-cream-50/80 px-4 py-3 backdrop-blur lg:px-8">
        <button class="rounded-lg p-2 text-brand-600 hover:bg-brand-50 lg:hidden" @click="sidebarOpen = true"><Icon name="menu" :size="20" /></button>
        <div class="relative hidden max-w-md flex-1 sm:block">
          <Icon name="search" :size="17" class="absolute top-1/2 left-3 -translate-y-1/2 text-brand-300" />
          <input v-model="search" type="text" placeholder="Cari penghuni, kamar, transaksi…" class="w-full rounded-xl border border-brand-200/60 bg-white py-2 pr-3 pl-9 text-sm placeholder:text-brand-300 focus:border-brand-500 focus:ring-4 focus:ring-brand-500/10 focus:outline-none" />
        </div>
        <div class="flex flex-1 items-center justify-end gap-2">
          <span class="hidden items-center gap-1.5 text-xs font-medium text-brand-400 md:flex"><Icon name="calendar" :size="14" /> {{ today }}</span>
          <button class="relative rounded-xl p-2.5 text-brand-600 hover:bg-brand-50"><Icon name="bell" :size="19" /><span class="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-gold-500 ring-2 ring-cream-50" /></button>
          <RouterLink to="/app/booking" class="btn-primary hidden sm:inline-flex"><Icon name="plus" :size="16" /> Booking Baru</RouterLink>
        </div>
      </header>

      <main class="flex-1 px-4 py-6 pb-24 lg:px-8 lg:py-8">
        <div class="mx-auto max-w-6xl">
          <RouterView v-slot="{ Component }">
            <Transition name="fade" mode="out-in"><component :is="Component" :key="route.fullPath" /></Transition>
          </RouterView>
        </div>
      </main>
    </div>

    <!-- Bottom nav mobile -->
    <nav class="fixed inset-x-0 bottom-0 z-30 flex border-t border-brand-700/5 bg-white/95 backdrop-blur lg:hidden">
      <RouterLink v-for="item in mobileNav" :key="item.to" :to="item.to" class="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[10px] font-medium" :class="isActive(item) ? 'text-brand-600' : 'text-brand-400'">
        <Icon :name="item.icon" :size="20" />{{ item.label }}
      </RouterLink>
    </nav>
  </div>
</template>
