<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { useKostStore } from '../stores/kost'
import Icon from '../components/Icon.vue'

const store = useKostStore()
const scrolled = ref(false)
const onScroll = () => (scrolled.value = window.scrollY > 20)
onMounted(() => window.addEventListener('scroll', onScroll))
onUnmounted(() => window.removeEventListener('scroll', onScroll))

const totalRooms = store.rooms.length
const totalProps = store.properties.length

const features = [
  { icon: 'building', title: 'Multi-Properti', desc: 'Kelola banyak cabang kos se-Pontianak dari satu dasbor. Ganti properti dengan sekali klik.' },
  { icon: 'calendar', title: 'Booking Harian', desc: 'Reservasi kamar per malam, hitung total otomatis, check-in & check-out terjadwal.' },
  { icon: 'wallet', title: 'Keuangan Terpadu', desc: 'Laba rugi, arus kas, pengeluaran per kategori, dan margin real-time.' },
  { icon: 'message', title: 'WhatsApp Center', desc: 'Broadcast promo ke channel & kirim pesan personal ke penghuni via WhatsApp API.' },
  { icon: 'chart', title: 'Analitik & Laporan', desc: 'Okupansi per cabang, sumber booking, kamar terlaba — semua tervisualisasi.' },
  { icon: 'receipt', title: 'Pembayaran & Invoice', desc: 'Catat transfer, QRIS, tunai. Riwayat invoice rapi dan bisa diekspor.' },
]

const areas = ['Pontianak Kota', 'Pontianak Selatan', 'Pontianak Tenggara', 'Pontianak Timur', 'Pontianak Barat', 'Pontianak Utara']
const tech = [
  { name: 'Vue 3', desc: 'Composition API' },
  { name: 'Vite', desc: 'Build super cepat' },
  { name: 'Tailwind v4', desc: 'Desain utility-first' },
  { name: 'Pinia', desc: 'State management' },
  { name: 'Cloudflare', desc: 'Hosting global' },
]
const steps = [
  { n: '01', title: 'Daftarkan properti', desc: 'Tambah cabang kos & kamar beserta tarif dan fasilitas.' },
  { n: '02', title: 'Kelola booking', desc: 'Terima reservasi, atur check-in/out, pantau okupansi.' },
  { n: '03', title: 'Tumbuhkan bisnis', desc: 'Analisis performa & jangkau penghuni lewat WhatsApp.' },
]
</script>

<template>
  <div class="min-h-screen bg-cream-50 text-brand-900">
    <!-- NAV -->
    <header class="fixed inset-x-0 top-0 z-50 transition" :class="scrolled ? 'bg-cream-50/90 shadow-sm backdrop-blur' : ''">
      <div class="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
        <a href="#top" class="flex items-center gap-2.5">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl text-white ring-1 ring-white/10" :class="scrolled ? 'bg-brand-700' : 'bg-brand-600'"><Icon name="home" :size="20" /></span>
          <span>
            <span class="block font-display text-lg leading-tight font-bold" :class="scrolled ? 'text-brand-800' : 'text-white'">Daily Kost</span>
            <span class="block text-[10px] tracking-widest" :class="scrolled ? 'text-brand-400' : 'text-gold-300/80'">PONTIANAK · PREMIUM</span>
          </span>
        </a>
        <nav class="hidden items-center gap-7 text-sm font-medium md:flex" :class="scrolled ? 'text-brand-600' : 'text-white/85'">
          <a href="#fitur" class="transition hover:opacity-70">Fitur</a>
          <a href="#area" class="transition hover:opacity-70">Area</a>
          <a href="#teknologi" class="transition hover:opacity-70">Teknologi</a>
          <a href="#cara" class="transition hover:opacity-70">Cara Kerja</a>
        </nav>
        <RouterLink to="/app" class="btn-primary"><Icon name="dashboard" :size="16" /> Buka Dashboard</RouterLink>
      </div>
    </header>

    <!-- HERO -->
    <section id="top" class="relative overflow-hidden bg-brand-700 pt-32 pb-24 text-white">
      <div class="absolute inset-0 opacity-[0.07]" style="background-image: radial-gradient(circle at 20% 30%, white 1.5px, transparent 1.5px); background-size: 28px 28px;" />
      <div class="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-brand-600/40 blur-3xl" />
      <div class="absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-gold-500/10 blur-3xl" />
      <div class="relative mx-auto max-w-6xl px-5">
        <div class="grid items-center gap-12 lg:grid-cols-2">
          <div>
            <span class="chip bg-white/10 text-gold-300 ring-1 ring-white/15"><Icon name="sparkles" :size="14" /> Manajemen Kos Digital Terpadu</span>
            <h1 class="mt-5 font-display text-4xl leading-[1.1] font-bold text-white sm:text-5xl lg:text-6xl">
              Kelola kos <span class="text-gold-400">se-Pontianak</span> dari satu dashboard mewah.
            </h1>
            <p class="mt-5 max-w-lg text-lg text-brand-100">
              Properti, kamar, booking harian, keuangan, hingga broadcast WhatsApp — semua rapi, profesional, dan real-time. Dibangun untuk pemilik kos modern.
            </p>
            <div class="mt-8 flex flex-wrap gap-3">
              <RouterLink to="/app" class="btn-gold px-6 py-3 text-base"><Icon name="arrowRight" :size="18" /> Lihat Demo Live</RouterLink>
              <a href="#fitur" class="btn px-6 py-3 text-base text-white ring-1 ring-white/20 hover:bg-white/10">Pelajari Fitur</a>
            </div>
            <div class="mt-10 flex gap-8">
              <div><p class="font-display text-3xl font-bold text-white">{{ totalProps }}</p><p class="text-sm text-brand-200">Cabang Kos</p></div>
              <div><p class="font-display text-3xl font-bold text-white">{{ totalRooms }}+</p><p class="text-sm text-brand-200">Kamar Dikelola</p></div>
              <div><p class="font-display text-3xl font-bold text-white">6</p><p class="text-sm text-brand-200">Area Pontianak</p></div>
            </div>
          </div>

          <!-- Mock dashboard card -->
          <div class="relative">
            <div class="card-lg rotate-1 p-5 transition hover:rotate-0">
              <div class="flex items-center justify-between border-b border-brand-700/5 pb-3">
                <div class="flex items-center gap-2"><span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white"><Icon name="home" :size="15" /></span><span class="font-display font-bold text-brand-800">Dashboard</span></div>
                <span class="chip bg-emerald-50 text-emerald-600">● Live</span>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-3">
                <div class="rounded-xl bg-brand-50 p-3"><p class="text-xs text-brand-400">Okupansi</p><p class="font-display text-2xl font-bold text-brand-700">{{ store.occupancyRate }}%</p></div>
                <div class="rounded-xl bg-gold-300/20 p-3"><p class="text-xs text-brand-400">Pendapatan</p><p class="font-display text-2xl font-bold text-gold-600">Rp27jt</p></div>
              </div>
              <div class="mt-3 flex h-24 items-end gap-1.5 rounded-xl bg-brand-50/60 p-3">
                <div v-for="(h, i) in [40, 55, 45, 70, 60, 85, 75, 95]" :key="i" class="flex-1 rounded-t bg-gradient-to-t from-brand-600 to-brand-400" :style="{ height: h + '%' }" />
              </div>
            </div>
            <div class="card absolute -bottom-6 -left-6 flex items-center gap-2 p-3 shadow-xl">
              <span class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-white"><Icon name="message" :size="17" /></span>
              <div><p class="text-xs font-semibold text-brand-800">Broadcast terkirim</p><p class="text-[10px] text-brand-400">128 penghuni</p></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- FEATURES -->
    <section id="fitur" class="mx-auto max-w-6xl px-5 py-20">
      <div class="mx-auto max-w-2xl text-center">
        <span class="chip bg-brand-50 text-brand-600">Fitur Unggulan</span>
        <h2 class="mt-4 font-display text-3xl font-bold text-brand-800 sm:text-4xl">Semua yang dibutuhkan pemilik kos</h2>
        <p class="mt-3 text-brand-500">Dari operasional harian sampai pertumbuhan bisnis — dalam satu platform.</p>
      </div>
      <div class="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div v-for="f in features" :key="f.title" class="card group p-6 transition hover:-translate-y-1">
          <span class="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-50 text-brand-600 transition group-hover:bg-brand-600 group-hover:text-white"><Icon :name="f.icon" :size="22" /></span>
          <h3 class="mt-4 font-display text-lg font-bold text-brand-800">{{ f.title }}</h3>
          <p class="mt-2 text-sm text-brand-500">{{ f.desc }}</p>
        </div>
      </div>
    </section>

    <!-- AREA -->
    <section id="area" class="bg-white py-20">
      <div class="mx-auto max-w-6xl px-5">
        <div class="grid items-center gap-10 lg:grid-cols-2">
          <div>
            <span class="chip bg-brand-50 text-brand-600"><Icon name="mapPin" :size="14" /> Jangkauan</span>
            <h2 class="mt-4 font-display text-3xl font-bold text-brand-800 sm:text-4xl">Menjangkau seluruh Pontianak</h2>
            <p class="mt-3 text-brand-500">Kelola properti kos di enam kecamatan Kota Pontianak dalam satu sistem. Pantau okupansi dan pendapatan tiap area secara terpisah maupun gabungan.</p>
            <RouterLink to="/app/properti" class="btn-dark mt-6"><Icon name="building" :size="16" /> Lihat Semua Cabang</RouterLink>
          </div>
          <div class="grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div v-for="(a, i) in areas" :key="a" class="rounded-2xl p-4 text-white" :style="{ background: `linear-gradient(135deg, hsl(${140 + i * 8} 42% 32%), hsl(${140 + i * 8} 52% 22%))` }">
              <Icon name="mapPin" :size="18" class="text-gold-300" />
              <p class="mt-2 text-sm font-semibold">{{ a.replace('Pontianak ', '') }}</p>
              <p class="text-[11px] text-white/60">Pontianak</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- TECH -->
    <section id="teknologi" class="mx-auto max-w-6xl px-5 py-20">
      <div class="mx-auto max-w-2xl text-center">
        <span class="chip bg-brand-50 text-brand-600"><Icon name="sparkles" :size="14" /> Dibangun dengan Teknologi Modern</span>
        <h2 class="mt-4 font-display text-3xl font-bold text-brand-800 sm:text-4xl">Cepat, aman, dan siap produksi</h2>
        <p class="mt-3 text-brand-500">Stack modern untuk pengalaman yang mulus di semua perangkat.</p>
      </div>
      <div class="mt-10 flex flex-wrap justify-center gap-3">
        <div v-for="t in tech" :key="t.name" class="card flex items-center gap-3 px-5 py-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-700 text-xs font-bold text-gold-300">{{ t.name.slice(0, 2) }}</span>
          <div><p class="text-sm font-bold text-brand-800">{{ t.name }}</p><p class="text-[11px] text-brand-400">{{ t.desc }}</p></div>
        </div>
      </div>
    </section>

    <!-- STEPS -->
    <section id="cara" class="bg-white py-20">
      <div class="mx-auto max-w-6xl px-5">
        <div class="mx-auto max-w-2xl text-center">
          <span class="chip bg-brand-50 text-brand-600">Cara Kerja</span>
          <h2 class="mt-4 font-display text-3xl font-bold text-brand-800 sm:text-4xl">Mulai dalam tiga langkah</h2>
        </div>
        <div class="mt-12 grid gap-6 md:grid-cols-3">
          <div v-for="s in steps" :key="s.n" class="relative">
            <span class="font-display text-5xl font-bold text-brand-100">{{ s.n }}</span>
            <h3 class="mt-2 font-display text-xl font-bold text-brand-800">{{ s.title }}</h3>
            <p class="mt-2 text-sm text-brand-500">{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- CTA -->
    <section class="mx-auto max-w-6xl px-5 py-16">
      <div class="relative overflow-hidden rounded-3xl bg-brand-700 px-8 py-14 text-center text-white">
        <div class="absolute -top-16 -right-16 h-64 w-64 rounded-full bg-gold-500/15 blur-3xl" />
        <div class="relative">
          <h2 class="font-display text-3xl font-bold sm:text-4xl">Siap kelola kos-mu lebih profesional?</h2>
          <p class="mx-auto mt-3 max-w-xl text-brand-100">Coba dashboard demo sekarang — tanpa registrasi, data contoh sudah siap.</p>
          <RouterLink to="/app" class="btn-gold mt-7 px-7 py-3 text-base"><Icon name="arrowRight" :size="18" /> Masuk Dashboard Demo</RouterLink>
        </div>
      </div>
    </section>

    <!-- FOOTER -->
    <footer class="border-t border-brand-700/5 bg-cream-50 py-10">
      <div class="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 text-sm text-brand-400 sm:flex-row">
        <div class="flex items-center gap-2">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg bg-brand-700 text-white"><Icon name="home" :size="15" /></span>
          <span class="font-display font-bold text-brand-700">Daily Kost Pontianak</span>
        </div>
        <p>© 2026 Daily Kost. Manajemen kos harian premium.</p>
      </div>
    </footer>
  </div>
</template>
