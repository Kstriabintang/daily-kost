<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { RouterLink } from 'vue-router'
import Icon from '../Icon.vue'

defineProps({ solid: Boolean })
const scrolled = ref(false)
const onScroll = () => (scrolled.value = window.scrollY > 24)
onMounted(() => { onScroll(); window.addEventListener('scroll', onScroll) })
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const isDark = ref(false)
onMounted(() => { isDark.value = document.documentElement.dataset.theme === 'dark' })
function toggleTheme() {
  isDark.value = !isDark.value
  const t = isDark.value ? 'dark' : 'light'
  document.documentElement.dataset.theme = t
  try { localStorage.setItem('dk-theme', t) } catch (e) { /* ignore */ }
}
</script>

<template>
  <header class="fixed inset-x-0 top-0 z-50 transition-all duration-300"
    :class="(scrolled || solid) ? 'bg-surface/85 shadow-[0_4px_24px_-8px_rgba(16,56,42,0.15)] backdrop-blur-lg' : ''">
    <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-3.5">
      <RouterLink to="/" class="flex items-center gap-2.5">
        <span class="flex h-10 w-10 items-center justify-center rounded-xl text-white ring-1 ring-white/10 transition" :class="(scrolled || solid) ? 'bg-brand-600' : 'bg-brand-600'"><Icon name="home" :size="20" /></span>
        <span>
          <span class="block font-display text-lg leading-tight font-bold transition" :class="(scrolled || solid) ? 'text-ink' : 'text-white'">Daily Kost</span>
          <span class="block text-[10px] tracking-[0.2em] transition" :class="(scrolled || solid) ? 'text-gold-600' : 'text-gold-300/90'">PONTIANAK</span>
        </span>
      </RouterLink>

      <nav class="hidden items-center gap-7 text-sm font-medium transition md:flex" :class="(scrolled || solid) ? 'text-muted' : 'text-white/90'">
        <RouterLink to="/cari" class="hover:opacity-70">Cari Kamar</RouterLink>
        <RouterLink to="/cari?area=Pontianak Kota" class="hover:opacity-70">Lokasi</RouterLink>
        <a href="/#kenapa" class="hover:opacity-70">Kenapa Kami</a>
      </nav>

      <div class="flex items-center gap-2">
        <button type="button" @click="toggleTheme" :aria-label="isDark ? 'Mode terang' : 'Mode gelap'"
          class="flex h-10 w-10 items-center justify-center rounded-xl ring-1 transition"
          :class="(scrolled || solid) ? 'text-strong ring-line hover:bg-tint' : 'text-white ring-white/20 hover:bg-white/10'">
          <Icon :name="isDark ? 'sun' : 'moon'" :size="18" />
        </button>
        <RouterLink to="/cari" class="btn-primary"><Icon name="search" :size="16" /> <span class="hidden sm:inline">Pesan Sekarang</span></RouterLink>
      </div>
    </div>
  </header>
</template>
