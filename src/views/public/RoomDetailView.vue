<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useKostStore, DURATIONS, durationByKey, todayStr, nowStr, addHours } from '../../stores/kost'
import { rupiah, tanggalWaktu } from '../../utils/format'
import PhotoBox from '../../components/public/PhotoBox.vue'
import RoomCard from '../../components/public/RoomCard.vue'
import Icon from '../../components/Icon.vue'

const store = useKostStore()
const route = useRoute()
const router = useRouter()

const room = computed(() => { const r = store.roomById(route.params.id); return r ? store.enrichRoom(r) : null })
const activeImg = ref(0)
const gallery = computed(() => (room.value ? [room.value.id, room.value.id + '-a', room.value.id + '-b', room.value.id + '-c'] : []))

const defaultTime = () => `${String(Math.min(23, new Date().getHours() + 1)).padStart(2, '0')}:00`
const booking = reactive({
  date: route.query.date || todayStr(),
  time: route.query.time || defaultTime(),
  durasi: route.query.durasi || '6j',
  guests: Number(route.query.guests) || 1,
})
const checkInAt = computed(() => `${booking.date}T${booking.time}`)
const dur = computed(() => durationByKey(booking.durasi))
const total = computed(() => (room.value ? (room.value.rates?.[booking.durasi] ?? room.value.dailyRate) : 0))
const checkOutAt = computed(() => addHours(checkInAt.value, dur.value.hours))
const available = computed(() => room.value && store.isRoomAvailable(room.value.id, checkInAt.value, booking.durasi))

const facilityIcons = { AC: 'sparkles', 'Smart TV': 'eye', Netflix: 'eye', 'WiFi cepat': 'sparkles', 'KM dalam': 'home', 'Air panas': 'sparkles', 'Kulkas mini': 'home', 'Meja kerja': 'edit', Sofa: 'home', Bathtub: 'home', 'City view': 'building' }

const similar = computed(() => {
  if (!room.value) return []
  return store.searchRooms({ area: room.value.area }).filter((r) => r.id !== room.value.id).slice(0, 3)
})

function goBook() {
  if (!available.value) return
  router.push({ path: `/pesan/${room.value.id}`, query: { date: booking.date, time: booking.time, durasi: booking.durasi, guests: booking.guests } })
}
</script>

<template>
  <div v-if="room" class="pt-24 pb-28 lg:pb-16">
    <div class="mx-auto max-w-6xl px-5">
      <nav class="mb-4 flex items-center gap-1.5 text-sm text-brand-400">
        <RouterLink to="/" class="hover:text-brand-600">Beranda</RouterLink><Icon name="chevronRight" :size="14" />
        <RouterLink to="/cari" class="hover:text-brand-600">Cari Kamar</RouterLink><Icon name="chevronRight" :size="14" />
        <span class="text-brand-600">Kamar {{ room.number }}</span>
      </nav>

      <!-- Gallery -->
      <div class="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div class="h-64 overflow-hidden rounded-2xl sm:h-96 animate-fade"><PhotoBox :seed="gallery[activeImg]" :hue="room.property?.hue" :w="1200" :h="800" :alt="room.property?.name" /></div>
        <div class="grid grid-cols-4 gap-3 lg:grid-cols-2">
          <button v-for="(g, i) in gallery" :key="g" class="h-20 overflow-hidden rounded-xl ring-2 transition sm:h-[11.25rem] lg:h-[calc(50%-6px)]" :class="activeImg === i ? 'ring-brand-600' : 'ring-transparent hover:ring-brand-200'" @click="activeImg = i"><PhotoBox :seed="g" :hue="room.property?.hue" :w="400" :h="300" /></button>
        </div>
      </div>

      <div class="mt-8 grid gap-8 lg:grid-cols-[1fr_380px]">
        <div>
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div class="flex items-center gap-2">
                <span class="chip bg-brand-50 text-brand-600">{{ room.type }}</span>
                <span class="chip bg-gold-300/25 text-gold-600"><Icon name="clock" :size="12" /> Kos Singgah 24 Jam</span>
              </div>
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
            <div v-for="fac in room.facilities" :key="fac" class="flex items-center gap-2.5 rounded-xl bg-white p-3 ring-1 ring-brand-700/5">
              <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-600"><Icon :name="facilityIcons[fac] || 'checkCircle'" :size="17" /></span>
              <span class="text-sm font-medium text-brand-700">{{ fac }}</span>
            </div>
          </div>

          <div class="my-6 h-px bg-brand-700/5" />
          <h2 class="font-display text-xl font-bold text-brand-800">Tentang Kamar Ini</h2>
          <p class="mt-3 leading-relaxed text-brand-600">
            Kamar transit {{ room.type }} di {{ room.property?.name }}, {{ room.area }}. Cocok untuk singgah sementara — istirahat, transit perjalanan, atau butuh tempat nyaman beberapa jam. Sudah termasuk <b>AC, Smart TV + Netflix, WiFi cepat, dan kamar mandi dalam</b>. Bersih, wangi, dan siap huni 24 jam. Sewa fleksibel per 3 jam, 6 jam, 12 jam, atau harian — semua campur, tanpa ribet, tanpa login.
          </p>
          <div class="mt-4 flex flex-wrap gap-3">
            <span class="chip bg-emerald-50 text-emerald-600"><Icon name="checkCircle" :size="14" /> Bebas Netflix & TV</span>
            <span class="chip bg-emerald-50 text-emerald-600"><Icon name="checkCircle" :size="14" /> Kamar mandi dalam</span>
            <span class="chip bg-emerald-50 text-emerald-600"><Icon name="checkCircle" :size="14" /> Bersih & wangi</span>
            <span class="chip bg-emerald-50 text-emerald-600"><Icon name="checkCircle" :size="14" /> Check-in 24 jam</span>
          </div>
        </div>

        <!-- Booking widget -->
        <div>
          <div class="sticky top-24 card-lg p-5">
            <p class="text-sm text-brand-400">Pilih durasi sewa</p>
            <div class="mt-2 grid grid-cols-2 gap-2">
              <button v-for="d in DURATIONS" :key="d.key" type="button" @click="booking.durasi = d.key"
                class="rounded-xl border-2 p-3 text-left transition" :class="booking.durasi === d.key ? 'border-brand-600 bg-brand-50/60' : 'border-brand-100 hover:border-brand-200'">
                <span class="block text-sm font-semibold text-brand-800">{{ d.label }}</span>
                <span class="block font-display text-base font-bold text-brand-600">{{ rupiah(room.rates?.[d.key] ?? room.dailyRate) }}</span>
              </button>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-2 overflow-hidden rounded-xl border border-brand-200/70">
              <label class="border-r border-brand-200/70 p-3"><span class="block text-[11px] font-semibold text-brand-400">TANGGAL</span><input v-model="booking.date" type="date" :min="todayStr()" class="mt-0.5 w-full bg-transparent text-sm font-medium text-brand-800 focus:outline-none" /></label>
              <label class="p-3"><span class="block text-[11px] font-semibold text-brand-400">JAM MASUK</span><input v-model="booking.time" type="time" class="mt-0.5 w-full bg-transparent text-sm font-medium text-brand-800 focus:outline-none" /></label>
            </div>

            <div class="mt-3 flex items-center justify-between rounded-lg bg-brand-50/60 px-3 py-2 text-xs text-brand-500">
              <span>Selesai</span><span class="font-medium text-brand-700">{{ tanggalWaktu(checkOutAt) }}</span>
            </div>

            <div v-if="!available" class="mt-3 flex items-center gap-2 rounded-lg bg-rose-50 px-3 py-2 text-xs font-medium text-rose-500"><Icon name="alert" :size="14" /> Tidak tersedia untuk waktu ini.</div>

            <div class="mt-4 flex items-end justify-between border-t border-brand-700/5 pt-3">
              <span class="text-sm text-brand-500">Total ({{ dur.label }})</span>
              <span class="font-display text-2xl font-bold text-brand-700">{{ rupiah(total) }}</span>
            </div>

            <button class="btn-primary mt-4 w-full py-3 text-base" :disabled="!available" @click="goBook"><Icon name="arrowRight" :size="18" /> Pesan Sekarang</button>
            <p class="mt-2 text-center text-[11px] text-brand-400">Belum ditagih — bayar saat check-in</p>
          </div>
        </div>
      </div>

      <div v-if="similar.length" class="mt-14">
        <h2 v-reveal class="mb-5 font-display text-2xl font-bold text-brand-800">Kamar lain di {{ room.area?.replace('Pontianak ', '') }}</h2>
        <div class="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="(r, i) in similar" :key="r.id" v-reveal="{ delay: i * 80 }"><RoomCard :room="r" /></div>
        </div>
      </div>
    </div>

    <!-- Mobile bottom bar -->
    <div class="glass fixed inset-x-0 bottom-0 z-40 border-t border-brand-700/10 px-4 py-3 shadow-[0_-8px_24px_-12px_rgba(16,56,42,0.25)] lg:hidden">
      <div class="mx-auto flex max-w-6xl items-center justify-between gap-3">
        <div>
          <p class="font-display text-lg font-bold text-brand-700">{{ rupiah(total) }}<span class="text-xs font-normal text-brand-400"> / {{ dur.label }}</span></p>
          <p class="flex items-center gap-1 text-[11px] text-brand-400"><Icon name="star" :size="11" class="text-gold-500" /> {{ room.rating }} · {{ room.area?.replace('Pontianak ', '') }}</p>
        </div>
        <button class="btn-primary px-7 py-3 text-base" :disabled="!available" @click="goBook"><Icon name="arrowRight" :size="18" /> Pesan</button>
      </div>
    </div>
  </div>

  <div v-else class="flex min-h-[60vh] flex-col items-center justify-center pt-24 text-center">
    <h1 class="font-display text-2xl font-bold text-brand-800">Kamar tidak ditemukan</h1>
    <RouterLink to="/cari" class="btn-primary mt-4">Cari kamar lain</RouterLink>
  </div>
</template>
