<script setup>
import { computed } from 'vue'
import { useRoute, RouterLink } from 'vue-router'
import { useKostStore, durationByKey, addHours } from '../../stores/kost'
import { rupiah, tanggalWaktu } from '../../utils/format'
import Icon from '../../components/Icon.vue'

const store = useKostStore()
const route = useRoute()

const room = computed(() => {
  const r = store.roomById(route.query.roomId)
  return r ? store.enrichRoom(r) : null
})
const code = computed(() => route.query.code || 'DK000000')
const durasi = computed(() => durationByKey(route.query.durasi))
const checkInAt = computed(() => (route.query.date && route.query.time ? `${route.query.date}T${route.query.time}` : null))
const checkOutAt = computed(() => (checkInAt.value ? addHours(checkInAt.value, durasi.value.hours) : null))
const total = computed(() => (room.value ? (room.value.rates?.[route.query.durasi] ?? room.value.dailyRate) : 0))
</script>

<template>
  <div class="flex min-h-screen items-center justify-center px-5 pt-24 pb-16">
    <div class="w-full max-w-lg">
      <!-- Animated check -->
      <div class="relative mx-auto mb-6 h-24 w-24">
        <span class="absolute inset-0 rounded-full bg-emerald-400/40" style="animation: pulse-ring 2s ease-out infinite" />
        <span class="absolute inset-0 rounded-full bg-emerald-400/30" style="animation: pulse-ring 2s ease-out infinite 0.4s" />
        <div class="animate-pop relative flex h-24 w-24 items-center justify-center rounded-full bg-emerald-500 shadow-lg shadow-emerald-500/30">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
            <path d="M20 6 9 17l-5-5" style="stroke-dasharray: 30; stroke-dashoffset: 30; animation: draw-check 0.5s ease-out 0.35s forwards" />
          </svg>
        </div>
      </div>

      <div class="animate-rise text-center" style="animation-delay: 200ms">
        <h1 class="font-display text-3xl font-bold text-ink">Pemesanan Berhasil! 🎉</h1>
        <p class="mt-2 text-muted">Terima kasih{{ route.query.name ? `, ${route.query.name}` : '' }}. Booking-mu sudah kami terima.</p>
      </div>

      <!-- Ticket -->
      <div class="animate-rise mt-7 overflow-hidden rounded-2xl bg-surface shadow-[0_20px_50px_-20px_rgba(16,56,42,0.4)] ring-1 ring-line" style="animation-delay: 320ms">
        <div class="flex items-center justify-between bg-brand-700 px-6 py-4 text-white">
          <div><p class="text-[11px] tracking-wide text-brand-200">KODE BOOKING</p><p class="font-display text-2xl font-bold tracking-wider">{{ code }}</p></div>
          <Icon name="receipt" :size="28" class="text-gold-300" />
        </div>

        <div v-if="room" class="p-6">
          <div class="flex items-center justify-between">
            <div><h2 class="font-display text-lg font-bold text-ink">{{ room.property?.name }}</h2><p class="flex items-center gap-1 text-xs text-soft"><Icon name="mapPin" :size="12" /> Kamar {{ room.number }} · {{ room.area }}</p></div>
            <span class="chip bg-tint text-accent">{{ room.type }}</span>
          </div>

          <div class="my-4 grid grid-cols-3 gap-2 rounded-xl bg-tint/60 p-3 text-center">
            <div><p class="text-[11px] text-soft">Masuk</p><p class="text-sm font-semibold text-ink">{{ tanggalWaktu(checkInAt) }}</p></div>
            <div><p class="text-[11px] text-soft">Selesai</p><p class="text-sm font-semibold text-ink">{{ tanggalWaktu(checkOutAt) }}</p></div>
            <div><p class="text-[11px] text-soft">Durasi</p><p class="text-sm font-semibold text-ink">{{ durasi.label }}</p></div>
          </div>

          <div class="flex items-center justify-between border-t border-dashed border-line pt-4">
            <div><p class="text-xs text-soft">Total</p><p class="font-display text-2xl font-bold text-strong">{{ rupiah(total) }}</p></div>
            <span class="chip bg-gold-300/25 text-gold-600">{{ route.query.payment || 'Bayar di tempat' }}</span>
          </div>
        </div>
      </div>

      <div class="animate-rise mt-4 flex items-start gap-2 rounded-xl bg-emerald-50 p-4 text-sm text-emerald-700" style="animation-delay: 420ms">
        <Icon name="message" :size="18" class="mt-0.5 shrink-0" />
        <p>Detail booking & instruksi check-in akan dikirim ke WhatsApp-mu. Tunjukkan kode booking saat tiba di lokasi.</p>
      </div>

      <div class="animate-rise mt-5 flex gap-3" style="animation-delay: 520ms">
        <RouterLink to="/cari" class="btn-outline flex-1 py-3">Cari kamar lain</RouterLink>
        <RouterLink to="/" class="btn-primary flex-1 py-3">Kembali ke Beranda</RouterLink>
      </div>
    </div>
  </div>
</template>
