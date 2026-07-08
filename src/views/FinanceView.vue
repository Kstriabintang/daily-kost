<script setup>
import { computed } from 'vue'
import { useKostStore } from '../stores/kost'
import { rupiah, tanggal } from '../utils/format'
import StatCard from '../components/StatCard.vue'

const store = useKostStore()

const rows = computed(() =>
  [...store.bookings]
    .map((b) => ({
      ...b,
      room: store.roomById(b.roomId)?.number,
      nights: store.bookingNights(b),
      total: store.bookingTotal(b),
    }))
    .sort((a, b) => b.checkIn.localeCompare(a.checkIn))
)

function exportCsv() {
  const header = ['Tamu', 'Kamar', 'Check-in', 'Check-out', 'Malam', 'Total', 'Status']
  const lines = rows.value.map((r) =>
    [r.guestName, r.room, r.checkIn, r.checkOut, r.nights, r.total, r.paid ? 'Lunas' : 'Belum'].join(',')
  )
  const blob = new Blob([[header.join(','), ...lines].join('\n')], { type: 'text/csv' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = 'keuangan-daily-kost.csv'
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Keuangan</h1>
        <p class="text-sm text-slate-500">Ringkasan pemasukan & tagihan</p>
      </div>
      <button class="rounded-xl bg-slate-800 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-900" @click="exportCsv">
        ⬇ Export CSV
      </button>
    </div>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-3">
      <StatCard label="Total pemasukan" :value="rupiah(store.totalRevenue)" sub="dari booking lunas" icon="💰" tone="emerald" />
      <StatCard label="Tertunggak" :value="rupiah(store.outstanding)" sub="belum dibayar" icon="⚠️" tone="rose" />
      <StatCard label="Potensi / hari" :value="rupiah(store.revenueToday)" sub="kamar terisi saat ini" icon="📈" tone="indigo" />
    </div>

    <div class="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
      <div class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-slate-50 text-left text-xs font-semibold text-slate-500">
            <tr>
              <th class="px-4 py-3">Tamu</th>
              <th class="px-4 py-3">Kamar</th>
              <th class="px-4 py-3">Periode</th>
              <th class="px-4 py-3 text-right">Total</th>
              <th class="px-4 py-3 text-center">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-slate-100">
            <tr v-for="r in rows" :key="r.id" class="hover:bg-slate-50">
              <td class="px-4 py-3 font-medium text-slate-700">{{ r.guestName }}</td>
              <td class="px-4 py-3 text-slate-500">{{ r.room }}</td>
              <td class="px-4 py-3 text-slate-500">{{ tanggal(r.checkIn) }} – {{ tanggal(r.checkOut) }}</td>
              <td class="px-4 py-3 text-right font-semibold text-slate-700">{{ rupiah(r.total) }}</td>
              <td class="px-4 py-3 text-center">
                <span class="rounded-full px-2.5 py-1 text-xs font-medium" :class="r.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'">
                  {{ r.paid ? 'Lunas' : 'Belum' }}
                </span>
              </td>
            </tr>
            <tr v-if="!rows.length">
              <td colspan="5" class="px-4 py-10 text-center text-slate-400">Belum ada transaksi.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
