<script setup>
import { RouterView, RouterLink } from 'vue-router'

const nav = [
  { to: '/', label: 'Dashboard', icon: '🏠' },
  { to: '/kamar', label: 'Kamar', icon: '🚪' },
  { to: '/booking', label: 'Booking', icon: '📅' },
  { to: '/penghuni', label: 'Penghuni', icon: '👥' },
  { to: '/keuangan', label: 'Keuangan', icon: '💰' },
]
</script>

<template>
  <div class="min-h-screen lg:flex">
    <!-- Sidebar (desktop) -->
    <aside class="hidden w-64 shrink-0 border-r border-slate-200 bg-white lg:flex lg:flex-col">
      <div class="flex items-center gap-2 px-6 py-6">
        <span class="text-2xl">🏠</span>
        <div>
          <p class="font-bold leading-tight text-slate-800">Daily Kost</p>
          <p class="text-xs text-slate-400">Manajemen Kos Harian</p>
        </div>
      </div>
      <nav class="flex-1 space-y-1 px-3">
        <RouterLink
          v-for="item in nav"
          :key="item.to"
          :to="item.to"
          class="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-100"
          active-class="!bg-indigo-50 !text-indigo-600"
        >
          <span>{{ item.icon }}</span>{{ item.label }}
        </RouterLink>
      </nav>
      <p class="px-6 py-4 text-xs text-slate-300">v0.1.0 · demo lokal</p>
    </aside>

    <!-- Main -->
    <div class="flex-1 pb-20 lg:pb-0">
      <header class="flex items-center gap-2 border-b border-slate-200 bg-white px-4 py-4 lg:hidden">
        <span class="text-xl">🏠</span>
        <span class="font-bold text-slate-800">Daily Kost</span>
      </header>
      <main class="mx-auto max-w-5xl px-4 py-6 lg:px-8 lg:py-8">
        <RouterView v-slot="{ Component }">
          <Transition
            mode="out-in"
            enter-active-class="transition duration-200 ease-out"
            enter-from-class="opacity-0 translate-y-1"
            leave-active-class="transition duration-100 ease-in"
            leave-to-class="opacity-0"
          >
            <component :is="Component" />
          </Transition>
        </RouterView>
      </main>
    </div>

    <!-- Bottom nav (mobile) -->
    <nav class="fixed inset-x-0 bottom-0 z-40 flex border-t border-slate-200 bg-white lg:hidden">
      <RouterLink
        v-for="item in nav"
        :key="item.to"
        :to="item.to"
        class="flex flex-1 flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium text-slate-500"
        active-class="!text-indigo-600"
      >
        <span class="text-lg">{{ item.icon }}</span>{{ item.label }}
      </RouterLink>
    </nav>
  </div>
</template>
