<script setup>
import { computed, reactive, ref } from 'vue'
import { useKostStore, todayStr, daysBetween } from '../stores/kost'
import { rupiah, tanggal } from '../utils/format'
import ModalDialog from '../components/ModalDialog.vue'

const store = useKostStore()

const open = ref(false)
const tab = ref('active')

const form = reactive({
  roomId: '',
  guestName: '',
  guestPhone: '',
  checkIn: todayStr(),
  checkOut: '',
})

const nights = computed(() => {
  if (!form.checkIn || !form.checkOut) return 0
  if (form.checkOut <= form.checkIn) return 0
  return daysBetween(form.checkIn, form.checkOut)
})
const previewTotal = computed(() => {
  const room = store.roomById(form.roomId)
  return room ? room.dailyRate * nights.value : 0
})

const history = computed(() => store.bookings.filter((b) => b.status === 'checkout'))

function openCreate() {
  Object.assign(form, {
    roomId: store.availableRooms[0]?.id ?? '',
    guestName: '',
    guestPhone: '',
    checkIn: todayStr(),
    checkOut: '',
  })
  open.value = true
}

function save() {
  if (!form.roomId || !form.guestName.trim() || nights.value < 1) return
  const res = store.addBooking({
    roomId: form.roomId,
    guestName: form.guestName.trim(),
    guestPhone: form.guestPhone.trim(),
    checkIn: form.checkIn,
    checkOut: form.checkOut,
  })
  if (!res.ok) return alert(res.msg)
  open.value = false
}

function doCheckout(b) {
  if (confirm(`Check-out ${b.guestName} dari kamar ${store.roomById(b.roomId)?.number}?`)) store.checkout(b.id)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Booking</h1>
        <p class="text-sm text-slate-500">{{ store.activeBookings.length }} penghuni aktif</p>
      </div>
      <button
        class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700 disabled:opacity-40"
        :disabled="!store.availableRooms.length"
        @click="openCreate"
      >
        + Booking Baru
      </button>
    </div>

    <div class="flex gap-1 rounded-xl bg-slate-100 p-1 text-sm font-medium">
      <button class="flex-1 rounded-lg py-1.5" :class="tab === 'active' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'" @click="tab = 'active'">
        Aktif ({{ store.activeBookings.length }})
      </button>
      <button class="flex-1 rounded-lg py-1.5" :class="tab === 'history' ? 'bg-white text-slate-800 shadow-sm' : 'text-slate-500'" @click="tab = 'history'">
        Riwayat ({{ history.length }})
      </button>
    </div>

    <!-- Active -->
    <div v-if="tab === 'active'" class="space-y-3">
      <div v-for="b in store.activeBookings" :key="b.id" class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div class="flex items-start justify-between gap-3">
          <div class="flex items-center gap-3">
            <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-indigo-50 text-sm font-bold text-indigo-600">
              {{ store.roomById(b.roomId)?.number }}
            </span>
            <div>
              <p class="font-semibold text-slate-800">{{ b.guestName }}</p>
              <p class="text-xs text-slate-400">{{ b.guestPhone || 'tanpa kontak' }}</p>
            </div>
          </div>
          <button
            class="rounded-full px-2.5 py-1 text-xs font-medium"
            :class="b.paid ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-600'"
            @click="store.togglePaid(b.id)"
          >
            {{ b.paid ? 'Lunas' : 'Belum bayar' }}
          </button>
        </div>

        <div class="mt-4 grid grid-cols-3 gap-2 border-t border-slate-100 pt-3 text-center">
          <div>
            <p class="text-xs text-slate-400">Check-in</p>
            <p class="text-sm font-medium text-slate-700">{{ tanggal(b.checkIn) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400">Check-out</p>
            <p class="text-sm font-medium text-slate-700">{{ tanggal(b.checkOut) }}</p>
          </div>
          <div>
            <p class="text-xs text-slate-400">{{ store.bookingNights(b) }} malam</p>
            <p class="text-sm font-bold text-indigo-600">{{ rupiah(store.bookingTotal(b)) }}</p>
          </div>
        </div>

        <div class="mt-4 flex gap-2">
          <button class="flex-1 rounded-lg bg-slate-800 py-2 text-sm font-semibold text-white hover:bg-slate-900" @click="doCheckout(b)">Check-out</button>
          <button class="rounded-lg px-3 py-2 text-sm font-medium text-rose-500 hover:bg-rose-50" @click="store.removeBooking(b.id)">Batal</button>
        </div>
      </div>
      <p v-if="!store.activeBookings.length" class="rounded-2xl bg-white py-10 text-center text-sm text-slate-400 ring-1 ring-slate-100">
        Belum ada booking aktif.
      </p>
    </div>

    <!-- History -->
    <div v-else class="space-y-3">
      <div v-for="b in history" :key="b.id" class="flex items-center justify-between rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
        <div class="flex items-center gap-3">
          <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-sm font-semibold text-slate-500">{{ store.roomById(b.roomId)?.number }}</span>
          <div>
            <p class="text-sm font-medium text-slate-700">{{ b.guestName }}</p>
            <p class="text-xs text-slate-400">{{ tanggal(b.checkIn) }} – {{ tanggal(b.checkOut) }} · {{ store.bookingNights(b) }} malam</p>
          </div>
        </div>
        <p class="text-sm font-semibold text-slate-600">{{ rupiah(store.bookingTotal(b)) }}</p>
      </div>
      <p v-if="!history.length" class="rounded-2xl bg-white py-10 text-center text-sm text-slate-400 ring-1 ring-slate-100">Belum ada riwayat.</p>
    </div>

    <!-- Modal -->
    <ModalDialog :open="open" title="Booking Baru" @close="open = false">
      <form class="space-y-4" @submit.prevent="save">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-600">Kamar</label>
          <select v-model="form.roomId" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none">
            <option v-for="r in store.availableRooms" :key="r.id" :value="r.id">
              Kamar {{ r.number }} · {{ r.type }} · {{ rupiah(r.dailyRate) }}/hari
            </option>
          </select>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600">Nama tamu</label>
            <input v-model="form.guestName" type="text" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600">No. HP</label>
            <input v-model="form.guestPhone" type="tel" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600">Check-in</label>
            <input v-model="form.checkIn" type="date" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600">Check-out</label>
            <input v-model="form.checkOut" type="date" :min="form.checkIn" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
          </div>
        </div>

        <div class="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
          <span class="text-sm text-slate-500">{{ nights }} malam</span>
          <span class="text-lg font-bold text-indigo-600">{{ rupiah(previewTotal) }}</span>
        </div>

        <div class="flex justify-end gap-2">
          <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100" @click="open = false">Batal</button>
          <button type="submit" :disabled="nights < 1 || !form.guestName.trim()" class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:opacity-40">Simpan Booking</button>
        </div>
      </form>
    </ModalDialog>
  </div>
</template>
