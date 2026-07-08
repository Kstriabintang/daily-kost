<script setup>
import { computed } from 'vue'
import { useKostStore } from '../stores/kost'
import { rupiah, tanggal } from '../utils/format'
import StatCard from '../components/StatCard.vue'

const store = useKostStore()

const checkoutSoon = computed(() =>
  [...store.activeBookings]
    .sort((a, b) => a.checkOut.localeCompare(b.checkOut))
    .slice(0, 5)
)
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Dashboard</h1>
      <p class="text-sm text-slate-500">Ringkasan operasional kos hari ini.</p>
    </div>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Okupansi" :value="`${store.occupancyRate}%`" :sub="`${store.activeBookings.length}/${store.rooms.length} kamar terisi`" icon="📊" tone="indigo" />
      <StatCard label="Pendapatan / hari" :value="rupiah(store.revenueToday)" sub="dari kamar terisi" icon="💵" tone="emerald" />
      <StatCard label="Kamar kosong" :value="store.availableRooms.length" sub="siap disewa" icon="🚪" tone="amber" />
      <StatCard label="Tagihan tertunggak" :value="rupiah(store.outstanding)" sub="belum dibayar" icon="⚠️" tone="rose" />
    </div>

    <div class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
      <div class="mb-4 flex items-center justify-between">
        <h2 class="font-semibold text-slate-800">Jadwal check-out terdekat</h2>
        <RouterLink to="/booking" class="text-sm font-medium text-indigo-600 hover:underline">Lihat semua</RouterLink>
      </div>

      <div v-if="checkoutSoon.length" class="divide-y divide-slate-100">
        <div v-for="b in checkoutSoon" :key="b.id" class="flex items-center justify-between py-3">
          <div class="flex items-center gap-3">
            <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-600">
              {{ store.roomById(b.roomId)?.number }}
            </span>
            <div>
              <p class="text-sm font-medium text-slate-800">{{ b.guestName }}</p>
              <p class="text-xs text-slate-400">Check-out {{ tanggal(b.checkOut) }}</p>
            </div>
          </div>
          <span
            class="rounded-full px-2.5 py-1 text-xs font-medium"
            :class="b.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'"
          >
            {{ b.paid ? 'Lunas' : 'Belum bayar' }}
          </span>
        </div>
      </div>
      <p v-else class="py-6 text-center text-sm text-slate-400">Belum ada penghuni aktif.</p>
    </div>
  </div>
</template>
