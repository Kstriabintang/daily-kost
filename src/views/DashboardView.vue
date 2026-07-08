<script setup>
import { computed, ref } from 'vue'
import { useKostStore } from '../stores/kost'
import { rupiah, rupiahShort, tanggal, tanggalWaktu, waktu } from '../utils/format'
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import Icon from '../components/Icon.vue'
import AreaChart from '../components/charts/AreaChart.vue'
import BarChart from '../components/charts/BarChart.vue'
import DonutChart from '../components/charts/DonutChart.vue'

const store = useKostStore()
const range = ref(14)

const series = computed(() => store.revenueSeries(range.value).map((d) => ({ ...d, date: tanggal(d.date, { year: undefined }) })))
const occByProp = computed(() => store.occupancyByProperty.map((p) => ({ label: p.area.replace('Pontianak ', ''), value: p.rate })))
const roomDist = computed(() => store.roomTypeDistribution)

const checkouts = computed(() => store.upcomingCheckouts.slice(0, 6))
const recent = computed(() =>
  [...store.payments]
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 6)
    .map((p) => {
      const b = store.bookings.find((x) => x.id === p.bookingId)
      const c = b && store.customerById(b.customerId)
      return { ...p, name: c?.name ?? 'Tamu', room: b && store.roomById(b.roomId)?.number }
    })
)
</script>

<template>
  <div>
    <PageHeader title="Dashboard" :subtitle="`Ringkasan operasional ${store.activePropertyId ? store.propertyById(store.activePropertyId).name : 'seluruh cabang Pontianak'} · hari ini`">
      <template #actions>
        <button class="btn-outline"><Icon name="download" :size="16" /> Ekspor</button>
        <RouterLink to="/app/laporan" class="btn-dark"><Icon name="chart" :size="16" /> Laporan</RouterLink>
      </template>
    </PageHeader>

    <!-- KPI -->
    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Okupansi" :value="`${store.occupancyRate}%`" :sub="`${store.scopedActiveBookings.length}/${store.scopedRooms.length} kamar`" icon="chart" tone="brand" :trend="8" />
      <StatCard label="Pendapatan Bulan Ini" :value="rupiahShort(store.revenueMonth)" sub="terkumpul" icon="money" tone="gold" :trend="12" />
      <StatCard label="Kamar Tersedia" :value="store.availableRooms.length" sub="siap disewa" icon="door" tone="emerald" />
      <StatCard label="Tunggakan" :value="rupiahShort(store.outstanding)" sub="belum dibayar" icon="alert" tone="rose" :trend="-4" />
    </div>

    <!-- Revenue chart -->
    <div class="mt-4 grid gap-4 lg:grid-cols-3">
      <div class="card p-5 lg:col-span-2">
        <div class="mb-4 flex items-center justify-between">
          <div>
            <h2 class="font-display text-lg font-bold text-brand-800">Tren Pendapatan</h2>
            <p class="text-sm text-brand-400">Total {{ rupiah(series.reduce((s, d) => s + d.value, 0)) }} dalam {{ range }} hari</p>
          </div>
          <div class="flex gap-1 rounded-lg bg-brand-50 p-1 text-xs font-semibold">
            <button v-for="r in [7, 14, 30]" :key="r" class="rounded-md px-2.5 py-1 transition" :class="range === r ? 'bg-white text-brand-600 shadow-sm' : 'text-brand-400'" @click="range = r">{{ r }}h</button>
          </div>
        </div>
        <AreaChart :data="series" :format="rupiah" :height="200" />
      </div>

      <div class="card p-5">
        <h2 class="font-display text-lg font-bold text-brand-800">Komposisi Kamar</h2>
        <p class="mb-3 text-sm text-brand-400">Berdasarkan tipe</p>
        <DonutChart :data="roomDist" :center-value="store.scopedRooms.length" center-label="Total Kamar" />
      </div>
    </div>

    <!-- Occupancy by property + checkouts -->
    <div class="mt-4 grid gap-4 lg:grid-cols-3">
      <div class="card p-5 lg:col-span-2">
        <h2 class="font-display text-lg font-bold text-brand-800">Okupansi per Cabang</h2>
        <p class="mb-4 text-sm text-brand-400">Tingkat hunian tiap area Pontianak</p>
        <BarChart :data="occByProp" :format="(v) => v + '%'" :height="180" />
      </div>

      <div class="card p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-display text-lg font-bold text-brand-800">Check-out Terdekat</h2>
          <RouterLink to="/app/booking" class="text-xs font-semibold text-brand-600 hover:underline">Semua</RouterLink>
        </div>
        <ul class="space-y-1">
          <li v-for="b in checkouts" :key="b.id" class="flex items-center gap-3 rounded-xl px-2 py-2 hover:bg-brand-50">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-xs font-bold text-brand-600">{{ store.roomById(b.roomId)?.number }}</span>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-brand-800">{{ store.customerById(b.customerId)?.name }}</p>
              <p class="text-xs text-brand-400">selesai {{ tanggalWaktu(store.bookingCheckOutAt(b)) }}</p>
            </div>
            <span class="chip" :class="b.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'">{{ b.paid ? 'Lunas' : 'Belum' }}</span>
          </li>
          <li v-if="!checkouts.length" class="py-6 text-center text-sm text-brand-300">Tidak ada penghuni aktif.</li>
        </ul>
      </div>
    </div>

    <!-- Recent activity -->
    <div class="mt-4 card p-5">
      <h2 class="mb-3 font-display text-lg font-bold text-brand-800">Transaksi Terbaru</h2>
      <div class="divide-y divide-brand-700/5">
        <div v-for="r in recent" :key="r.id" class="flex items-center gap-3 py-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"><Icon name="checkCircle" :size="17" /></span>
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-brand-800">{{ r.name }} <span class="text-brand-300">· Kamar {{ r.room }}</span></p>
            <p class="text-xs text-brand-400">{{ r.method }} · {{ tanggal(r.date) }}</p>
          </div>
          <span class="text-sm font-semibold text-brand-700">{{ rupiah(r.amount) }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
