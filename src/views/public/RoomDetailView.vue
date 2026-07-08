<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useKostStore, todayStr, addDays, daysBetween } from '../../stores/kost'
import { rupiah, tanggalPendek } from '../../utils/format'
import PhotoBox from '../../components/public/PhotoBox.vue'
import RoomCard from '../../components/public/RoomCard.vue'
import Icon from '../../components/Icon.vue'

const store = useKostStore()
const route = useRoute()
const router = useRouter()

const room = computed(() => {
  const r = store.roomById(route.params.id)
  return r ? store.enrichRoom(r) : null
})
const activeImg = ref(0)
const gallery = computed(() => (room.value ? [room.value.id, room.value.id + '-a', room.value.id + '-b', room.value.id + '-c'] : []))

const booking = reactive({
  checkIn: route.query.checkIn || todayStr(),
  checkOut: route.query.checkOut || addDays(todayStr(), 1),
  guests: Number(route.query.guests) || 1,
})
const nights = computed(() => (booking.checkOut > booking.checkIn ? daysBetween(booking.checkIn, booking.checkOut) : 0))
const total = computed(() => (room.value ? room.value.dailyRate * nights.value : 0))
const available = computed(() => room.value && store.isRoomAvailable(room.value.id, booking.checkIn, booking.checkOut))

const facilityIcons = { AC: 'sparkles', WiFi: 'sparkles', 'KM dalam': 'home', 'KM luar': 'home', TV: 'eye', 'Smart TV': 'eye', 'Water heater': 'sparkles', Kipas: 'sparkles', 'Meja kerja': 'edit', Balkon: 'building', 'Spring bed': 'bed', 'King bed': 'bed', Kasur: 'bed', 'Mini pantry': 'home' }

const similar = computed(() => {
  if (!room.value) return []
  return store.searchRooms({ area: room.value.area }).filter((r) => r.id !== room.value.id).slice(0, 3)
})

function goBook() {
  if (!nights.value || !available.value) return
  router.push({ path: `/pesan/${room.value.id}`, query: { checkIn: booking.checkIn, checkOut: booking.checkOut, guests: booking.guests } })
}
</script>

<template>
  <div v-if="room" class="pt-24 pb-28 lg:pb-16">
    <div class="mx-auto max-w-6xl px-5">
      <!-- Breadcrumb -->
      <nav class="mb-4 flex items-center gap-1.5 text-sm text-brand-400">
        <RouterLink to="/" class="hover:text-brand-600">Beranda</RouterLink><Icon name="chevronRight" :size="14" />
        <RouterLink to="/cari" class="hover:text-brand-600">Cari Kamar</RouterLink><Icon name="chevronRight" :size="14" />
        <span class="text-brand-600">Kamar {{ room.number }}</span>
      </nav>

      <!-- Gallery -->
      <div class="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div class="h-64 overflow-hidden rounded-2xl sm:h-96 animate-fade">
          <PhotoBox :seed="gallery[activeImg]" :hue="room.property?.hue" :w="1200" :h="800" :alt="room.property?.name" />
        </div>
        <div class="grid grid-cols-4 gap-3 lg:grid-cols-2">
          <button v-for="(g, i) in gallery" :key="g" class="h-20 overflow-hidden rounded-xl ring-2 transition sm:h-[11.25rem] lg:h-[calc(50%-6px)]" :class="activeImg === i ? 'ring-brand-600' : 'ring-transparent hover:ring-brand-200'" @click="activeImg = i">
            <PhotoBox :seed="g" :hue="room.property?.hue" :w="400" :h="300" />
          </button>
        </div>
      </div>

      <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_360px]">
        <!-- Info -->
        <div>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <span class="chip bg-brand-50 text-brand-600">{{ room.type }}</span>
              <h1 class="mt-2 font-display text-3xl font-bold text-brand-800">{{ room.property?.name }}</h1>
              <p class="mt-1 flex items-center gap-2 text-brand-500"><Icon name="mapPin" :size="15" /> {{ room.property?.address }}, {{ room.area }}</p>
            </div>
            <div class="rounded-xl bg-brand-700 px-4 py-2 text-center text-white">
              <p class="flex items-center gap-1 font-display text-xl font-bold"><Icon name="star" :size="16" class="text-gold-400" /> {{ room.rating }}</p>
              <p class="text-[11px] text-brand-200">{{ room.reviews }} ulasan</p>
            </div>
          </div>

          <div class="my-6 h-px bg-brand-700/5" />

          <h2 class="font-display text-xl font-bold text-brand-800">Fasilitas Kamar</h2>
          <div class="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3">
            <div v-for="f in room.facilities" :key="f" class="flex items-center gap-2.5 rounded-xl bg-white p-3 ring-1 ring-brand-700/5">
              <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon :name="facilityIcons[f] || 'checkCircle'" :size="17" /></span>
              <span class="text-sm font-medium text-brand-700">{{ f }}</span>
            </div>
          </div>

          <div class="my-6 h-px bg-brand-700/5" />

          <h2 class="font-display text-xl font-bold text-brand-800">Tentang Kamar Ini</h2>
          <p class="mt-3 leading-relaxed text-brand-600">
            Kamar {{ room.number }} tipe {{ room.type }} di {{ room.property?.name }} menawarkan kenyamanan hunian premium di jantung {{ room.area }}. Lantai {{ room.floor }}, cocok untuk mahasiswa maupun pekerja yang mengutamakan lokasi strategis, kebersihan, dan fasilitas lengkap. Tersedia untuk sewa harian maupun bulanan dengan proses pemesanan instan tanpa perlu login.
          </p>

          <div class="mt-4 flex flex-wrap gap-3">
            <span class="chip bg-emerald-50 text-emerald-600"><Icon name="checkCircle" :size="14" /> Sewa harian</span>
            <span class="chip bg-emerald-50 text-emerald-600"><Icon name="checkCircle" :size="14" /> Bebas biaya tersembunyi</span>
            <span class="chip bg-emerald-50 text-emerald-600"><Icon name="checkCircle" :size="14" /> Konfirmasi instan</span>
          </div>
        </div>

        <!-- Booking widget -->
        <div>
          <div class="sticky top-24 card-lg p-5">
            <div class="flex items-baseline gap-1">
              <span class="font-display text-2xl font-bold text-brand-700">{{ rupiah(room.dailyRate) }}</span>
              <span class="text-sm text-brand-400">/malam</span>
            </div>
            <p class="mt-0.5 text-xs text-brand-400">atau {{ rupiah(room.monthlyRate) }}/bulan</p>

            <div class="mt-4 overflow-hidden rounded-xl border border-brand-200/70">
              <div class="grid grid-cols-2 divide-x divide-brand-200/70">
                <label class="p-3"><span class="block text-[11px] font-semibold text-brand-400">CHECK-IN</span><input v-model="booking.checkIn" type="date" class="mt-0.5 w-full bg-transparent text-sm font-medium text-brand-800 focus:outline-none" /></label>
                <label class="p-3"><span class="block text-[11px] font-semibold text-brand-400">CHECK-OUT</span><input v-model="booking.checkOut" type="date" :min="booking.checkIn" class="mt-0.5 w-full bg-transparent text-sm font-medium text-brand-800 focus:outline-none" /></label>
              </div>
              <label class="block border-t border-brand-200/70 p-3"><span class="block text-[11px] font-semibold text-brand-400">TAMU</span>
                <select v-model.number="booking.guests" class="mt-0.5 w-full bg-transparent text-sm font-medium text-brand-800 focus:outline-none"><option v-for="n in 4" :key="n" :value="n">{{ n }} orang</option></select>
              </label>
            </div>

            <div v-if="!available" class="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-500"><Icon name="alert" :size="14" /> Tidak tersedia untuk tanggal ini.</div>

            <div v-if="nights && available" class="mt-4 space-y-2 text-sm">
              <div class="flex justify-between text-brand-500"><span>{{ rupiah(room.dailyRate) }} × {{ nights }} malam</span><span>{{ rupiah(total) }}</span></div>
              <div class="flex justify-between border-t border-brand-700/5 pt-2 font-semibold text-brand-800"><span>Total</span><span class="font-display text-lg text-brand-700">{{ rupiah(total) }}</span></div>
            </div>

            <button class="btn-primary mt-4 w-full py-3 text-base" :disabled="!nights || !available" @click="goBook">
              <Icon name="arrowRight" :size="18" /> Pesan Sekarang
            </button>
            <p class="mt-2 text-center text-[11px] text-brand-400">Belum ditagih — bayar saat check-in</p>
          </div>
        </div>
      </div>

      <!-- Similar -->
      <div v-if="similar.length" class="mt-14">
        <h2 v-reveal class="mb-5 font-display text-2xl font-bold text-brand-800">Kamar serupa di {{ room.area?.replace('Pontianak ', '') }}</h2>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="(r, i) in similar" :key="r.id" v-reveal="{ delay: i * 80 }"><RoomCard :room="r" /></div>
        </div>
      </div>
    </div>

    <!-- Mobile sticky booking bar -->
    <div class="glass fixed inset-x-0 bottom-0 z-40 border-t border-brand-700/10 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(16,56,42,0.25)] lg:hidden">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div>
          <p class="font-display text-lg font-bold text-brand-700">{{ rupiah(room.dailyRate) }}<span class="text-xs font-normal text-brand-400">/malam</span></p>
          <p class="flex items-center gap-1 text-[11px] text-brand-400"><Icon name="star" :size="11" class="text-gold-500" /> {{ room.rating }} · {{ nights }} malam</p>
        </div>
        <button class="btn-primary px-7 py-3 text-base" :disabled="!nights || !available" @click="goBook"><Icon name="arrowRight" :size="18" /> Pesan</button>
      </div>
    </div>
  </div>

  <div v-else class="flex min-h-[60vh] flex-col items-center justify-center pt-24 text-center">
    <h1 class="font-display text-2xl font-bold text-brand-800">Kamar tidak ditemukan</h1>
    <RouterLink to="/cari" class="btn-primary mt-4">Cari kamar lain</RouterLink>
  </div>
</template>
