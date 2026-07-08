<script setup>
import { RouterLink } from 'vue-router'
import { AREAS } from '../../stores/kost'
import Icon from '../Icon.vue'
</script>

<template>
  <footer class="bg-brand-800 text-brand-100">
    <div class="mx-auto max-w-6xl px-5 py-14">
      <div class="grid gap-10 md:grid-cols-4">
        <div class="md:col-span-1">
          <div class="flex items-center gap-2.5">
            <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white"><Icon name="home" :size="20" /></span>
            <span class="font-display text-lg font-bold text-white">Daily Kost</span>
          </div>
          <p class="mt-4 text-sm text-brand-300">Platform sewa kos harian premium terpercaya di seluruh Pontianak. Pesan cepat tanpa ribet.</p>
        </div>
        <div>
          <p class="mb-3 text-sm font-semibold text-white">Jelajahi</p>
          <ul class="space-y-2 text-sm text-brand-300">
            <li><RouterLink to="/cari" class="hover:text-white">Semua Kamar</RouterLink></li>
            <li><RouterLink to="/cari" class="hover:text-white">Promo Bulanan</RouterLink></li>
            <li><a href="/#kenapa" class="hover:text-white">Kenapa Daily Kost</a></li>
          </ul>
        </div>
        <div>
          <p class="mb-3 text-sm font-semibold text-white">Area Pontianak</p>
          <ul class="space-y-2 text-sm text-brand-300">
            <li v-for="a in AREAS.slice(0, 4)" :key="a"><RouterLink :to="`/cari?area=${encodeURIComponent(a)}`" class="hover:text-white">{{ a }}</RouterLink></li>
          </ul>
        </div>
        <div>
          <p class="mb-3 text-sm font-semibold text-white">Kontak</p>
          <ul class="space-y-2 text-sm text-brand-300">
            <li class="flex items-center gap-2"><Icon name="phone" :size="14" /> 0561-730000</li>
            <li class="flex items-center gap-2"><Icon name="message" :size="14" /> +62 812-0000-0000</li>
            <li class="flex items-center gap-2"><Icon name="mapPin" :size="14" /> Pontianak, Kalbar</li>
          </ul>
        </div>
      </div>
      <div class="mt-10 flex flex-col items-center justify-between gap-3 border-t border-white/10 pt-6 text-xs text-brand-400 sm:flex-row">
        <p>© 2026 Daily Kost Pontianak. Seluruh hak cipta dilindungi.</p>
        <p>Dibuat dengan Vue · Vite · Tailwind</p>
      </div>
    </div>
  </footer>
</template>
