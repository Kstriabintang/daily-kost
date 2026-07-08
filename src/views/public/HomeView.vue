<script setup>
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { useKostStore, AREAS } from '../../stores/kost'
import SearchBar from '../../components/public/SearchBar.vue'
import RoomCard from '../../components/public/RoomCard.vue'
import PhotoBox from '../../components/public/PhotoBox.vue'
import CountUp from '../../components/public/CountUp.vue'
import Icon from '../../components/Icon.vue'

const store = useKostStore()

const featured = computed(() => {
  const all = store.searchRooms({})
  // pick the best room per property first for variety, then fill with the rest
  const bestPerProp = []
  const seen = new Set()
  for (const r of [...all].sort((a, b) => b.dailyRate - a.dailyRate)) {
    if (!seen.has(r.propertyId)) { seen.add(r.propertyId); bestPerProp.push(r) }
  }
  const rest = all.filter((r) => !bestPerProp.includes(r)).sort((a, b) => b.dailyRate - a.dailyRate)
  return [...bestPerProp, ...rest].slice(0, 6)
})
const areaCards = computed(() =>
  AREAS.map((a) => ({
    name: a,
    short: a.replace('Pontianak ', ''),
    count: store.rooms.filter((r) => store.propertyById(r.propertyId)?.area === a).length,
    hue: 140 + AREAS.indexOf(a) * 8,
  })).filter((a) => a.count > 0)
)

const perks = [
  { icon: 'clock', title: 'Sewa Fleksibel', desc: 'Bayar sesuai kebutuhan — 3 jam, 6 jam, 12 jam, atau harian. Tanpa kontrak bulanan.' },
  { icon: 'sparkles', title: 'Fasilitas Lengkap', desc: 'AC, Smart TV + Netflix, WiFi cepat, dan kamar mandi dalam di setiap kamar.' },
  { icon: 'checkCircle', title: 'Bersih & Nyaman', desc: 'Kamar disterilisasi tiap tamu — wangi, rapi, dan siap huni 24 jam.' },
  { icon: 'money', title: 'Tanpa Login', desc: 'Pesan sebagai tamu, harga transparan, bayar di tempat atau transfer.' },
]
const steps = [
  { n: '1', icon: 'search', title: 'Pilih Durasi', desc: 'Tentukan lokasi, jam masuk, dan durasi — 3 jam hingga harian.' },
  { n: '2', icon: 'edit', title: 'Isi Data Tamu', desc: 'Cukup nama & nomor HP. Tanpa akun, tanpa ribet.' },
  { n: '3', icon: 'key', title: 'Check-in 24 Jam', desc: 'Terima kode booking, datang kapan saja, dan langsung istirahat.' },
]
</script>

<template>
  <div>
    <!-- HERO -->
    <section class="hero-mesh hero-mesh-animated relative overflow-hidden pt-24 pb-32 text-white sm:pt-28 sm:pb-40">
      <div class="grid-overlay absolute inset-0 opacity-60" />
      <div class="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-500/30 blur-3xl animate-float-slow" />
      <div class="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-gold-500/15 blur-3xl animate-float" />
      <div class="absolute top-1/3 left-1/2 h-72 w-72 -translate-x-1/2 rounded-full bg-emerald-400/10 blur-3xl" />

      <div class="relative mx-auto max-w-6xl px-5">
        <div class="mx-auto max-w-3xl text-center">
          <span class="chip animate-rise bg-white/10 text-gold-300 ring-1 ring-white/15 backdrop-blur"><Icon name="clock" :size="14" /> Kos Singgah & Transit · Sewa Per Jam di Pontianak</span>
          <h1 class="animate-rise mt-5 font-display text-4xl leading-[1.1] font-bold sm:text-5xl lg:text-6xl" style="animation-delay: 80ms">
            Butuh tempat <span class="text-gold-400">singgah</span><br />sebentar di Pontianak?
          </h1>
          <p class="animate-rise mx-auto mt-5 max-w-xl text-lg text-brand-100" style="animation-delay: 160ms">
            Sewa kamar per 3, 6, 12 jam, atau harian. AC, Smart TV + Netflix, kamar mandi dalam, bersih & nyaman — pesan tanpa login.
          </p>
        </div>

        <div class="animate-rise mx-auto mt-9 max-w-4xl" style="animation-delay: 240ms">
          <SearchBar />
        </div>

        <div class="animate-rise mx-auto mt-10 flex max-w-2xl flex-wrap items-center justify-center gap-x-10 gap-y-4 text-center" style="animation-delay: 320ms">
          <div><p class="font-display text-3xl font-bold"><CountUp :to="store.rooms.length" suffix="+" /></p><p class="text-sm text-brand-200">Kamar Tersedia</p></div>
          <div class="h-8 w-px bg-white/15" />
          <div><p class="font-display text-3xl font-bold"><CountUp :to="store.properties.length" /></p><p class="text-sm text-brand-200">Cabang Kos</p></div>
          <div class="h-8 w-px bg-white/15" />
          <div><p class="font-display text-3xl font-bold"><CountUp :to="1240" suffix="+" /></p><p class="text-sm text-brand-200">Tamu Puas</p></div>
          <div class="h-8 w-px bg-white/15" />
          <div><p class="flex items-center gap-1 font-display text-3xl font-bold"><Icon name="star" :size="22" class="text-gold-400" /> 4.8</p><p class="text-sm text-brand-200">Rating Rata-rata</p></div>
        </div>
      </div>

      <svg class="absolute -bottom-1 left-0 w-full text-[#f4f8f5]" viewBox="0 0 1440 80" preserveAspectRatio="none" fill="currentColor"><path d="M0 80V40c240 30 480 30 720 10S1200 20 1440 40v40Z" /></svg>
    </section>

    <!-- POPULAR ROOMS -->
    <section class="mx-auto max-w-6xl px-5 py-16">
      <div class="mb-8 flex items-end justify-between">
        <div v-reveal>
          <span class="chip bg-brand-50 text-brand-600"><Icon name="sparkles" :size="14" /> Pilihan Terpopuler</span>
          <h2 class="mt-3 font-display text-3xl font-bold text-brand-800">Kamar singgah favorit</h2>
        </div>
        <RouterLink to="/cari" class="hidden items-center gap-1 text-sm font-semibold text-brand-600 hover:gap-2 sm:flex">Lihat semua <Icon name="arrowRight" :size="16" /></RouterLink>
      </div>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="(r, i) in featured" :key="r.id" v-reveal="{ delay: i * 80 }">
          <RoomCard :room="r" />
        </div>
      </div>
      <div class="mt-8 text-center sm:hidden">
        <RouterLink to="/cari" class="btn-primary">Lihat semua kamar</RouterLink>
      </div>
    </section>

    <!-- AREAS -->
    <section class="bg-white py-16">
      <div class="mx-auto max-w-6xl px-5">
        <div v-reveal class="mx-auto mb-9 max-w-xl text-center">
          <span class="chip bg-brand-50 text-brand-600"><Icon name="mapPin" :size="14" /> Jelajahi Lokasi</span>
          <h2 class="mt-3 font-display text-3xl font-bold text-brand-800">Kos singgah di seluruh Pontianak</h2>
          <p class="mt-2 text-brand-500">Pilih area terdekat — semua kamar campur, siap huni 24 jam.</p>
        </div>
        <div class="grid grid-cols-2 gap-4 sm:grid-cols-3">
          <RouterLink v-for="(a, i) in areaCards" :key="a.name" :to="`/cari?area=${encodeURIComponent(a.name)}`"
            v-reveal="{ delay: i * 60 }"
            class="group relative h-40 overflow-hidden rounded-2xl">
            <div class="h-full w-full transition-transform duration-700 group-hover:scale-110">
              <PhotoBox :seed="`area-${a.short}`" :hue="a.hue" :w="500" :h="400" :alt="a.name" />
            </div>
            <div class="absolute inset-0 bg-gradient-to-t from-brand-950/80 to-transparent" />
            <div class="absolute bottom-3 left-4 text-white">
              <p class="font-display text-lg font-bold">{{ a.short }}</p>
              <p class="text-xs text-white/80">{{ a.count }} kamar</p>
            </div>
            <Icon name="arrowRight" :size="18" class="absolute top-3 right-3 text-white opacity-0 transition group-hover:opacity-100" />
          </RouterLink>
        </div>
      </div>
    </section>

    <!-- WHY -->
    <section id="kenapa" class="mx-auto max-w-6xl px-5 py-16">
      <div v-reveal class="mx-auto mb-10 max-w-xl text-center">
        <span class="chip bg-brand-50 text-brand-600">Kenapa Daily Kost</span>
        <h2 class="mt-3 font-display text-3xl font-bold text-brand-800">Cara termudah pesan kos</h2>
      </div>
      <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="(p, i) in perks" :key="p.title" v-reveal="{ delay: i * 80 }" class="card group p-6 text-center transition hover:-translate-y-1">
          <span class="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white"><Icon :name="p.icon" :size="26" /></span>
          <h3 class="mt-4 font-display text-lg font-bold text-brand-800">{{ p.title }}</h3>
          <p class="mt-2 text-sm text-brand-500">{{ p.desc }}</p>
        </div>
      </div>
    </section>

    <!-- STEPS -->
    <section class="bg-brand-800 py-16 text-white">
      <div class="mx-auto max-w-6xl px-5">
        <div v-reveal class="mx-auto mb-12 max-w-xl text-center">
          <span class="chip bg-white/10 text-gold-300">Semudah 1-2-3</span>
          <h2 class="mt-3 font-display text-3xl font-bold">Pesan dalam tiga langkah</h2>
        </div>
        <div class="grid gap-6 md:grid-cols-3">
          <div v-for="(s, i) in steps" :key="s.n" v-reveal="{ delay: i * 120 }" class="relative rounded-2xl bg-brand-700/50 p-7 ring-1 ring-white/5">
            <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-500 text-brand-900"><Icon :name="s.icon" :size="26" /></span>
            <p class="mt-4 font-display text-4xl font-bold text-white/15">0{{ s.n }}</p>
            <h3 class="mt-1 font-display text-xl font-bold">{{ s.title }}</h3>
            <p class="mt-2 text-sm text-brand-200">{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="mx-auto max-w-6xl px-5 py-16">
      <div v-reveal class="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-600 to-brand-700 px-8 py-14 text-center text-white animate-gradient">
        <div class="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-gold-500/20 blur-3xl" />
        <div class="relative">
          <h2 class="font-display text-3xl font-bold sm:text-4xl">Butuh tempat istirahat sekarang?</h2>
          <p class="mx-auto mt-3 max-w-lg text-brand-100">Pesan kamar singgah dalam hitungan menit. Tanpa login, konfirmasi instan, check-in 24 jam.</p>
          <RouterLink to="/cari" class="btn-gold mt-7 px-8 py-3.5 text-base"><Icon name="search" :size="18" /> Cari Kamar Sekarang</RouterLink>
        </div>
      </div>
    </section>
  </div>
</template>
