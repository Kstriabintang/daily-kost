<script setup>
import { computed, ref } from 'vue'
import { useRouter } from 'vue-router'
import { useKostStore } from '../stores/kost'
import { rupiah, tanggal } from '../utils/format'
import PageHeader from '../components/PageHeader.vue'
import Avatar from '../components/Avatar.vue'
import Icon from '../components/Icon.vue'

const store = useKostStore()
const router = useRouter()
const q = ref('')

const tenants = computed(() => {
  const active = new Set(store.activeBookings.map((b) => b.customerId))
  return store.customers
    .map((c) => {
      const stays = store.bookings.filter((b) => b.customerId === c.id)
      const spent = store.payments.filter((p) => stays.some((s) => s.id === p.bookingId)).reduce((s, p) => s + p.amount, 0)
      const current = store.activeBookings.find((b) => b.customerId === c.id)
      return { ...c, stays: stays.length, spent, active: active.has(c.id), currentRoom: current && store.roomById(current.roomId)?.number }
    })
    .filter((c) => !q.value || c.name.toLowerCase().includes(q.value.toLowerCase()) || c.phone.includes(q.value))
    .sort((a, b) => Number(b.active) - Number(a.active) || b.stays - a.stays)
})

function waMessage(c) {
  store.activePropertyId = store.activePropertyId
  router.push({ path: '/whatsapp', query: { to: c.id } })
}
</script>

<template>
  <div>
    <PageHeader title="Penghuni" :subtitle="`${store.customers.length} penghuni terdaftar · ${tenants.filter(t => t.active).length} aktif`" />

    <div class="relative mb-4 max-w-sm">
      <Icon name="search" :size="17" class="absolute top-1/2 left-3 -translate-y-1/2 text-brand-300" />
      <input v-model="q" placeholder="Cari nama atau nomor HP…" class="input pl-9" />
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="t in tenants" :key="t.id" class="card p-5">
        <div class="flex items-center gap-3">
          <Avatar :name="t.name" :size="46" />
          <div class="min-w-0 flex-1">
            <p class="flex items-center gap-2 font-semibold text-brand-800"><span class="truncate">{{ t.name }}</span>
              <span v-if="t.active" class="h-2 w-2 shrink-0 rounded-full bg-emerald-500" /></p>
            <p class="flex items-center gap-1 truncate text-xs text-brand-400"><Icon name="phone" :size="11" /> {{ t.phone }}</p>
          </div>
        </div>

        <div v-if="t.active" class="mt-3 flex items-center gap-1.5 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-600">
          <Icon name="key" :size="13" /> Menghuni kamar {{ t.currentRoom }}
        </div>

        <div class="mt-3 grid grid-cols-2 gap-2 border-t border-brand-700/5 pt-3">
          <div><p class="text-xs text-brand-400">Menginap</p><p class="font-semibold text-brand-800">{{ t.stays }}×</p></div>
          <div><p class="text-xs text-brand-400">Total belanja</p><p class="font-semibold text-brand-600">{{ rupiah(t.spent) }}</p></div>
        </div>
        <p class="mt-2 text-[11px] text-brand-300">Bergabung {{ tanggal(t.joinedAt) }}</p>

        <button class="btn-outline mt-3 w-full py-2 text-emerald-600" @click="waMessage(t)"><Icon name="message" :size="15" /> Kirim WhatsApp</button>
      </div>
      <p v-if="!tenants.length" class="card col-span-full py-12 text-center text-sm text-brand-300">Tidak ada penghuni yang cocok.</p>
    </div>
  </div>
</template>
