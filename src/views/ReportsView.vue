<script setup>
import { computed } from 'vue'
import { useKostStore } from '../stores/kost'
import { rupiah, rupiahShort } from '../utils/format'
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import Icon from '../components/Icon.vue'
import BarChart from '../components/charts/BarChart.vue'
import DonutChart from '../components/charts/DonutChart.vue'

const store = useKostStore()

const occByProp = computed(() => store.occupancyByProperty.map((p) => ({ label: p.area.replace('Pontianak ', ''), value: p.rate })))
const sources = computed(() => store.sourceDistribution)

const avgStay = computed(() => {
  const bs = store.scopedBookings
  if (!bs.length) return 0
  return (bs.reduce((s, b) => s + store.bookingNights(b), 0) / bs.length).toFixed(1)
})
const avgRate = computed(() => {
  const rs = store.scopedRooms
  if (!rs.length) return 0
  return Math.round(rs.reduce((s, r) => s + r.dailyRate, 0) / rs.length)
})

const topRooms = computed(() => {
  const rev = {}
  for (const p of store.scopedPayments) {
    const b = store.bookings.find((x) => x.id === p.bookingId)
    if (b) rev[b.roomId] = (rev[b.roomId] || 0) + p.amount
  }
  return Object.entries(rev)
    .map(([roomId, amount]) => ({ room: store.roomById(roomId), amount }))
    .filter((r) => r.room)
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 6)
})
const maxTop = computed(() => Math.max(1, ...topRooms.value.map((r) => r.amount)))
</script>

<template>
  <div>
    <PageHeader title="Laporan & Analitik" subtitle="Wawasan performa portofolio kos">
      <template #actions><button class="btn-outline"><Icon name="download" :size="16" /> Ekspor PDF</button></template>
    </PageHeader>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Okupansi Rata-rata" :value="`${store.occupancyRate}%`" sub="seluruh cabang" icon="chart" tone="brand" />
      <StatCard label="Rata-rata Menginap" :value="`${avgStay} malam`" sub="per booking" icon="clock" tone="gold" />
      <StatCard label="Tarif Rata-rata" :value="rupiahShort(avgRate)" sub="per malam" icon="money" tone="emerald" />
      <StatCard label="Total Booking" :value="store.scopedBookings.length" sub="sepanjang waktu" icon="calendar" tone="slate" />
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-3">
      <div class="card p-5 lg:col-span-2">
        <h2 class="font-display text-lg font-bold text-brand-800">Okupansi per Cabang</h2>
        <p class="mb-4 text-sm text-brand-400">Perbandingan tingkat hunian antar area</p>
        <BarChart :data="occByProp" :format="(v) => v + '%'" :height="200" />
      </div>
      <div class="card p-5">
        <h2 class="font-display text-lg font-bold text-brand-800">Sumber Booking</h2>
        <p class="mb-3 text-sm text-brand-400">Kanal akuisisi tamu</p>
        <DonutChart :data="sources" :center-value="store.scopedBookings.length" center-label="Booking" :size="150" :thickness="20" />
      </div>
    </div>

    <div class="mt-4 card p-5">
      <h2 class="mb-4 font-display text-lg font-bold text-brand-800">Kamar Paling Menguntungkan</h2>
      <div class="space-y-3">
        <div v-for="(r, i) in topRooms" :key="r.room.id" class="flex items-center gap-3">
          <span class="flex h-8 w-8 items-center justify-center rounded-lg text-xs font-bold" :class="i === 0 ? 'bg-gold-500 text-brand-900' : 'bg-brand-50 text-brand-500'">#{{ i + 1 }}</span>
          <div class="w-28 shrink-0">
            <p class="text-sm font-medium text-brand-800">Kamar {{ r.room.number }}</p>
            <p class="text-xs text-brand-400">{{ store.propertyById(r.room.propertyId)?.area.replace('Pontianak ', '') }}</p>
          </div>
          <div class="h-2.5 flex-1 overflow-hidden rounded-full bg-brand-50">
            <div class="h-full rounded-full bg-gradient-to-r from-brand-500 to-brand-600" :style="{ width: (r.amount / maxTop) * 100 + '%' }" />
          </div>
          <span class="w-24 text-right text-sm font-semibold text-brand-700">{{ rupiah(r.amount) }}</span>
        </div>
        <p v-if="!topRooms.length" class="py-6 text-center text-sm text-brand-300">Belum ada data.</p>
      </div>
    </div>
  </div>
</template>
