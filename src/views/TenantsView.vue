<script setup>
import { computed } from 'vue'
import { useKostStore } from '../stores/kost'
import { rupiah, tanggal } from '../utils/format'

const store = useKostStore()

// Kumpulkan penghuni unik dari seluruh booking (berdasarkan nama + HP).
const tenants = computed(() => {
  const map = new Map()
  for (const b of store.bookings) {
    const key = `${b.guestName}|${b.guestPhone}`
    if (!map.has(key)) {
      map.set(key, { name: b.guestName, phone: b.guestPhone, stays: [], spent: 0 })
    }
    const t = map.get(key)
    t.stays.push(b)
    if (b.paid) t.spent += store.bookingTotal(b)
  }
  return [...map.values()].sort((a, b) => b.stays.length - a.stays.length)
})
</script>

<template>
  <div class="space-y-6">
    <div>
      <h1 class="text-2xl font-bold text-slate-800">Penghuni</h1>
      <p class="text-sm text-slate-500">{{ tenants.length }} penghuni tercatat</p>
    </div>

    <div class="grid gap-3 sm:grid-cols-2">
      <div v-for="t in tenants" :key="t.name + t.phone" class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div class="flex items-center gap-3">
          <span class="flex h-11 w-11 items-center justify-center rounded-full bg-indigo-100 text-sm font-bold text-indigo-600">
            {{ t.name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() }}
          </span>
          <div class="min-w-0">
            <p class="truncate font-semibold text-slate-800">{{ t.name }}</p>
            <p class="text-xs text-slate-400">{{ t.phone || 'tanpa kontak' }}</p>
          </div>
        </div>

        <div class="mt-4 grid grid-cols-2 gap-2 border-t border-slate-100 pt-3">
          <div>
            <p class="text-xs text-slate-400">Total menginap</p>
            <p class="text-sm font-semibold text-slate-700">{{ t.stays.length }}x</p>
          </div>
          <div>
            <p class="text-xs text-slate-400">Total belanja</p>
            <p class="text-sm font-semibold text-emerald-600">{{ rupiah(t.spent) }}</p>
          </div>
        </div>

        <p class="mt-3 text-xs text-slate-400">
          Terakhir: {{ tanggal(t.stays[t.stays.length - 1].checkIn) }} · Kamar {{ store.roomById(t.stays[t.stays.length - 1].roomId)?.number }}
        </p>
      </div>
    </div>

    <p v-if="!tenants.length" class="rounded-2xl bg-white py-10 text-center text-sm text-slate-400 ring-1 ring-slate-100">
      Belum ada penghuni. Buat booking dulu.
    </p>
  </div>
</template>
