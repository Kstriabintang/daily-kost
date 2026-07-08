<script setup>
import { reactive, ref } from 'vue'
import { useKostStore } from '../stores/kost'
import { rupiah } from '../utils/format'
import ModalDialog from '../components/ModalDialog.vue'

const store = useKostStore()

const open = ref(false)
const editId = ref(null)
const form = reactive({ number: '', type: 'Standard', dailyRate: 120000, facilities: '' })

function openCreate() {
  editId.value = null
  Object.assign(form, { number: '', type: 'Standard', dailyRate: 120000, facilities: '' })
  open.value = true
}

function openEdit(room) {
  editId.value = room.id
  Object.assign(form, {
    number: room.number,
    type: room.type,
    dailyRate: room.dailyRate,
    facilities: room.facilities.join(', '),
  })
  open.value = true
}

function save() {
  if (!form.number.trim()) return
  const payload = {
    number: form.number.trim(),
    type: form.type,
    dailyRate: Number(form.dailyRate) || 0,
    facilities: form.facilities.split(',').map((f) => f.trim()).filter(Boolean),
  }
  if (editId.value) store.updateRoom(editId.value, payload)
  else store.addRoom(payload)
  open.value = false
}

function del(room) {
  const res = store.removeRoom(room.id)
  if (!res.ok) alert(res.msg)
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center justify-between">
      <div>
        <h1 class="text-2xl font-bold text-slate-800">Kamar</h1>
        <p class="text-sm text-slate-500">{{ store.rooms.length }} kamar · {{ store.availableRooms.length }} kosong</p>
      </div>
      <button class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-indigo-700" @click="openCreate">
        + Tambah Kamar
      </button>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="room in store.rooms" :key="room.id" class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
        <div class="flex items-start justify-between">
          <div>
            <p class="text-lg font-bold text-slate-800">Kamar {{ room.number }}</p>
            <p class="text-xs text-slate-400">{{ room.type }}</p>
          </div>
          <span
            class="rounded-full px-2.5 py-1 text-xs font-medium"
            :class="store.roomStatus(room.id) === 'kosong' ? 'bg-emerald-50 text-emerald-600' : 'bg-slate-100 text-slate-500'"
          >
            {{ store.roomStatus(room.id) === 'kosong' ? 'Kosong' : 'Terisi' }}
          </span>
        </div>

        <p class="mt-3 text-xl font-bold text-indigo-600">
          {{ rupiah(room.dailyRate) }}<span class="text-sm font-normal text-slate-400"> / hari</span>
        </p>

        <div class="mt-3 flex flex-wrap gap-1.5">
          <span v-for="f in room.facilities" :key="f" class="rounded-md bg-slate-50 px-2 py-0.5 text-xs text-slate-500">{{ f }}</span>
        </div>

        <div class="mt-4 flex gap-2 border-t border-slate-100 pt-3">
          <button class="flex-1 rounded-lg bg-slate-50 py-1.5 text-sm font-medium text-slate-600 hover:bg-slate-100" @click="openEdit(room)">Edit</button>
          <button class="rounded-lg px-3 py-1.5 text-sm font-medium text-rose-500 hover:bg-rose-50" @click="del(room)">Hapus</button>
        </div>
      </div>
    </div>

    <ModalDialog :open="open" :title="editId ? 'Edit Kamar' : 'Tambah Kamar'" @close="open = false">
      <form class="space-y-4" @submit.prevent="save">
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-600">Nomor kamar</label>
          <input v-model="form.number" type="text" placeholder="mis. 103" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
        </div>
        <div class="grid grid-cols-2 gap-3">
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600">Tipe</label>
            <select v-model="form.type" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none">
              <option>Standard</option>
              <option>AC</option>
              <option>Deluxe</option>
            </select>
          </div>
          <div>
            <label class="mb-1 block text-sm font-medium text-slate-600">Tarif / hari</label>
            <input v-model.number="form.dailyRate" type="number" min="0" step="10000" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
          </div>
        </div>
        <div>
          <label class="mb-1 block text-sm font-medium text-slate-600">Fasilitas <span class="text-slate-400">(pisah dengan koma)</span></label>
          <input v-model="form.facilities" type="text" placeholder="AC, WiFi, Kamar mandi dalam" class="w-full rounded-xl border border-slate-200 px-3 py-2 text-sm focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 focus:outline-none" />
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="rounded-xl px-4 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100" @click="open = false">Batal</button>
          <button type="submit" class="rounded-xl bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">Simpan</button>
        </div>
      </form>
    </ModalDialog>
  </div>
</template>
