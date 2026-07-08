<script setup>
import { computed, reactive, ref } from 'vue'
import { useKostStore, todayStr, addDays, daysBetween } from '../stores/kost'
import { rupiah, tanggal, relatif } from '../utils/format'
import PageHeader from '../components/PageHeader.vue'
import ModalDialog from '../components/ModalDialog.vue'
import Avatar from '../components/Avatar.vue'
import Icon from '../components/Icon.vue'

const store = useKostStore()
const tab = ref('active')
const open = ref(false)

const form = reactive({ roomId: '', customerId: '', newName: '', newPhone: '', checkIn: todayStr(), checkOut: addDays(todayStr(), 2), source: 'Walk-in' })

const nights = computed(() => (form.checkIn && form.checkOut && form.checkOut > form.checkIn ? daysBetween(form.checkIn, form.checkOut) : 0))
const previewTotal = computed(() => (store.roomById(form.roomId)?.dailyRate ?? 0) * nights.value)

const active = computed(() => [...store.scopedActiveBookings].sort((a, b) => a.checkOut.localeCompare(b.checkOut)))
const history = computed(() => store.scopedBookings.filter((b) => b.status === 'checkout').sort((a, b) => b.checkOut.localeCompare(a.checkOut)))

function openCreate() {
  Object.assign(form, { roomId: store.availableRooms[0]?.id ?? '', customerId: '', newName: '', newPhone: '', checkIn: todayStr(), checkOut: addDays(todayStr(), 2), source: 'Walk-in' })
  open.value = true
}
function save() {
  if (!form.roomId || nights.value < 1) return
  let customerId = form.customerId
  if (!customerId) {
    if (!form.newName.trim()) return
    customerId = store.addCustomer({ name: form.newName.trim(), phone: form.newPhone.trim(), email: '', idNumber: '' }).id
  }
  const res = store.addBooking({ roomId: form.roomId, customerId, checkIn: form.checkIn, checkOut: form.checkOut, source: form.source })
  if (!res.ok) return alert(res.msg)
  open.value = false
}
function doCheckout(b) {
  if (confirm(`Check-out ${store.customerById(b.customerId)?.name}?`)) store.checkout(b.id)
}
const sourceTone = { 'Walk-in': 'bg-brand-50 text-brand-500', WhatsApp: 'bg-emerald-50 text-emerald-600', OTA: 'bg-gold-300/25 text-gold-600', Referral: 'bg-slate-100 text-slate-500', Website: 'bg-brand-600 text-white' }
</script>

<template>
  <div>
    <PageHeader title="Booking & Reservasi" :subtitle="`${active.length} penghuni aktif`">
      <template #actions>
        <button class="btn-primary" :disabled="!store.availableRooms.length" @click="openCreate"><Icon name="plus" :size="16" /> Booking Baru</button>
      </template>
    </PageHeader>

    <div class="mb-4 inline-flex rounded-xl bg-white p-1 ring-1 ring-brand-700/5 shadow-sm">
      <button class="rounded-lg px-5 py-2 text-sm font-semibold transition" :class="tab === 'active' ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-400'" @click="tab = 'active'">Aktif ({{ active.length }})</button>
      <button class="rounded-lg px-5 py-2 text-sm font-semibold transition" :class="tab === 'history' ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-400'" @click="tab = 'history'">Riwayat ({{ history.length }})</button>
    </div>

    <!-- Active -->
    <div v-if="tab === 'active'" class="grid gap-3 lg:grid-cols-2">
      <div v-for="b in active" :key="b.id" class="card p-5">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <Avatar :name="store.customerById(b.customerId)?.name" :hue="store.propertyOfRoom(b.roomId)?.hue" :size="44" />
            <div>
              <p class="font-semibold text-brand-800">{{ store.customerById(b.customerId)?.name }}</p>
              <p class="flex items-center gap-1 text-xs text-brand-400"><Icon name="door" :size="12" /> Kamar {{ store.roomById(b.roomId)?.number }} · {{ store.propertyOfRoom(b.roomId)?.area.replace('Pontianak ', '') }}</p>
            </div>
          </div>
          <button class="chip" :class="b.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'" @click="store.togglePaid(b.id)">{{ b.paid ? 'Lunas' : 'Belum bayar' }}</button>
        </div>

        <div class="mt-4 grid grid-cols-3 gap-2 rounded-xl bg-brand-50/60 p-3 text-center">
          <div><p class="text-[11px] text-brand-400">Check-in</p><p class="text-sm font-semibold text-brand-700">{{ tanggal(b.checkIn, { year: undefined }) }}</p></div>
          <div><p class="text-[11px] text-brand-400">Check-out</p><p class="text-sm font-semibold text-brand-700">{{ tanggal(b.checkOut, { year: undefined }) }}</p><p class="text-[10px] text-gold-600">{{ relatif(b.checkOut) }}</p></div>
          <div><p class="text-[11px] text-brand-400">{{ store.bookingNights(b) }} malam</p><p class="text-sm font-bold text-brand-600">{{ rupiah(store.bookingTotal(b)) }}</p></div>
        </div>

        <div class="mt-3 flex items-center gap-2">
          <span class="chip" :class="sourceTone[b.source]">{{ b.source }}</span>
          <div class="flex-1" />
          <button class="btn-dark px-4 py-2" @click="doCheckout(b)"><Icon name="logout" :size="15" /> Check-out</button>
          <button class="btn px-3 py-2 text-rose-500 hover:bg-rose-50" @click="store.removeBooking(b.id)"><Icon name="trash" :size="15" /></button>
        </div>
      </div>
      <p v-if="!active.length" class="card col-span-full py-12 text-center text-sm text-brand-300">Belum ada booking aktif.</p>
    </div>

    <!-- History -->
    <div v-else class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-brand-50/60"><tr><th class="th">Tamu</th><th class="th">Kamar</th><th class="th">Periode</th><th class="th">Sumber</th><th class="th text-right">Total</th></tr></thead>
          <tbody class="divide-y divide-brand-700/5">
            <tr v-for="b in history" :key="b.id" class="hover:bg-brand-50/40">
              <td class="td font-medium">{{ store.customerById(b.customerId)?.name }}</td>
              <td class="td text-brand-400">{{ store.roomById(b.roomId)?.number }}</td>
              <td class="td text-brand-400">{{ tanggal(b.checkIn, { year: undefined }) }} – {{ tanggal(b.checkOut, { year: undefined }) }} · {{ store.bookingNights(b) }}m</td>
              <td class="td"><span class="chip" :class="sourceTone[b.source]">{{ b.source }}</span></td>
              <td class="td text-right font-semibold">{{ rupiah(store.bookingTotal(b)) }}</td>
            </tr>
            <tr v-if="!history.length"><td colspan="5" class="td py-10 text-center text-brand-300">Belum ada riwayat.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal -->
    <ModalDialog :open="open" title="Booking Baru" subtitle="Reservasi kamar harian" @close="open = false">
      <form class="space-y-4" @submit.prevent="save">
        <div><label class="label">Kamar</label><select v-model="form.roomId" class="input"><option v-for="r in store.availableRooms" :key="r.id" :value="r.id">{{ store.propertyById(r.propertyId)?.name }} · Kamar {{ r.number }} · {{ rupiah(r.dailyRate) }}/hari</option></select></div>
        <div><label class="label">Penghuni</label><select v-model="form.customerId" class="input"><option value="">+ Tamu baru</option><option v-for="c in store.customers" :key="c.id" :value="c.id">{{ c.name }} · {{ c.phone }}</option></select></div>
        <div v-if="!form.customerId" class="grid grid-cols-2 gap-3">
          <div><label class="label">Nama tamu</label><input v-model="form.newName" class="input" placeholder="Nama lengkap" /></div>
          <div><label class="label">No. HP</label><input v-model="form.newPhone" class="input" placeholder="0812..." /></div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="label">Check-in</label><input v-model="form.checkIn" type="date" class="input" /></div>
          <div><label class="label">Check-out</label><input v-model="form.checkOut" type="date" :min="form.checkIn" class="input" /></div>
        </div>
        <div><label class="label">Sumber booking</label><select v-model="form.source" class="input"><option>Walk-in</option><option>WhatsApp</option><option>OTA</option><option>Referral</option></select></div>

        <div class="flex items-center justify-between rounded-xl bg-brand-700 px-4 py-3 text-white">
          <span class="text-sm text-brand-100">{{ nights }} malam</span>
          <span class="font-display text-xl font-bold text-gold-300">{{ rupiah(previewTotal) }}</span>
        </div>
        <div class="flex justify-end gap-2"><button type="button" class="btn-ghost" @click="open = false">Batal</button><button type="submit" :disabled="nights < 1" class="btn-primary">Simpan Booking</button></div>
      </form>
    </ModalDialog>
  </div>
</template>
