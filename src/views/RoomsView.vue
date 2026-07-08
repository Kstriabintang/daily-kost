<script setup>
import { computed, reactive, ref } from 'vue'
import { useKostStore, DURATIONS } from '../stores/kost'
import { rupiah } from '../utils/format'
import PageHeader from '../components/PageHeader.vue'
import ModalDialog from '../components/ModalDialog.vue'
import Icon from '../components/Icon.vue'

const store = useKostStore()
const filter = ref('semua')
const open = ref(false)
const editId = ref(null)

const emptyRates = () => ({ '3j': 40000, '6j': 60000, '12j': 90000, '1h': 130000, '3h': 330000, '1mg': 700000 })
const form = reactive({ propertyId: '', number: '', floor: 1, type: 'Standard', rates: emptyRates(), facilities: '' })

const rooms = computed(() => {
  let list = store.scopedRooms
  if (filter.value === 'kosong') list = list.filter((r) => store.roomStatus(r.id) === 'kosong')
  if (filter.value === 'terisi') list = list.filter((r) => store.roomStatus(r.id) === 'terisi')
  return [...list].sort((a, b) => a.propertyId.localeCompare(b.propertyId) || a.number.localeCompare(b.number))
})

function openCreate() {
  editId.value = null
  Object.assign(form, { propertyId: store.activePropertyId || store.properties[0]?.id, number: '', floor: 1, type: 'Standard', rates: emptyRates(), facilities: 'AC, Smart TV, Netflix, WiFi cepat, KM dalam' })
  open.value = true
}
function openEdit(r) {
  editId.value = r.id
  Object.assign(form, { propertyId: r.propertyId, number: r.number, floor: r.floor, type: r.type, rates: { ...emptyRates(), ...(r.rates || {}) }, facilities: r.facilities.join(', ') })
  open.value = true
}
function save() {
  if (!form.number.trim()) return
  const rates = {}
  for (const d of DURATIONS) rates[d.key] = Number(form.rates[d.key]) || 0
  const payload = { propertyId: form.propertyId, number: form.number, type: form.type, floor: Number(form.floor) || 1, rates, facilities: form.facilities.split(',').map((f) => f.trim()).filter(Boolean) }
  if (editId.value) store.updateRoom(editId.value, payload)
  else store.addRoom(payload)
  open.value = false
}
function del(r) {
  const res = store.removeRoom(r.id)
  if (!res.ok) alert(res.msg)
}
</script>

<template>
  <div>
    <PageHeader title="Kamar" :subtitle="`${store.scopedRooms.length} kamar · ${store.availableRooms.length} kosong sekarang`">
      <template #actions>
        <button class="btn-primary" @click="openCreate"><Icon name="plus" :size="16" /> Tambah Kamar</button>
      </template>
    </PageHeader>

    <div class="mb-4 flex gap-1 rounded-xl bg-white p-1 ring-1 ring-brand-700/5 shadow-sm sm:inline-flex">
      <button v-for="f in [['semua', 'Semua'], ['kosong', 'Kosong'], ['terisi', 'Terisi']]" :key="f[0]"
        class="flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none" :class="filter === f[0] ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-400 hover:text-brand-600'" @click="filter = f[0]">{{ f[1] }}</button>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="r in rooms" :key="r.id" class="card p-5">
        <div class="flex items-start justify-between">
          <div>
            <p class="font-display text-xl font-bold text-brand-800">Kamar {{ r.number }}</p>
            <p class="text-xs text-brand-400">{{ store.propertyById(r.propertyId)?.name }} · Lt. {{ r.floor }}</p>
          </div>
          <span class="chip" :class="store.roomStatus(r.id) === 'kosong' ? 'bg-emerald-50 text-emerald-600' : 'bg-brand-50 text-brand-500'">
            <span class="h-1.5 w-1.5 rounded-full" :class="store.roomStatus(r.id) === 'kosong' ? 'bg-emerald-500' : 'bg-brand-400'" />
            {{ store.roomStatus(r.id) === 'kosong' ? 'Kosong' : 'Terisi' }}
          </span>
        </div>

        <div class="mt-3 flex items-end justify-between">
          <div>
            <p class="text-[11px] text-brand-400">mulai</p>
            <p class="font-display text-xl font-bold text-brand-600">{{ rupiah(r.rates?.['3j'] ?? r.dailyRate) }}<span class="text-xs font-normal text-brand-300">/3 jam</span></p>
            <p class="text-xs text-brand-400">{{ rupiah(r.rates?.['1h'] ?? r.dailyRate) }}/hari</p>
          </div>
          <span class="chip bg-gold-300/25 text-gold-600">{{ r.type }}</span>
        </div>

        <div class="mt-3 flex flex-wrap gap-1.5">
          <span v-for="f in r.facilities" :key="f" class="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] text-brand-500">{{ f }}</span>
        </div>

        <div class="mt-4 flex gap-2 border-t border-brand-700/5 pt-3">
          <button class="btn-outline flex-1 py-2" @click="openEdit(r)"><Icon name="edit" :size="15" /> Edit</button>
          <button class="btn px-3 py-2 text-rose-500 hover:bg-rose-50" @click="del(r)"><Icon name="trash" :size="15" /></button>
        </div>
      </div>
    </div>

    <ModalDialog :open="open" :title="editId ? 'Edit Kamar' : 'Tambah Kamar'" @close="open = false">
      <form class="space-y-4" @submit.prevent="save">
        <div><label class="label">Properti</label><select v-model="form.propertyId" class="input"><option v-for="p in store.properties" :key="p.id" :value="p.id">{{ p.name }}</option></select></div>
        <div class="grid grid-cols-3 gap-3">
          <div><label class="label">Nomor</label><input v-model="form.number" class="input" placeholder="101" /></div>
          <div><label class="label">Lantai</label><input v-model.number="form.floor" type="number" min="1" class="input" /></div>
          <div><label class="label">Kelas</label><select v-model="form.type" class="input"><option>Standard</option><option>Deluxe</option><option>Executive</option></select></div>
        </div>
        <div>
          <label class="label">Harga per durasi</label>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div v-for="d in DURATIONS" :key="d.key">
              <span class="block text-[11px] font-medium text-brand-400">{{ d.label }}</span>
              <input v-model.number="form.rates[d.key]" type="number" step="5000" class="input py-2 text-sm" />
            </div>
          </div>
        </div>
        <div><label class="label">Fasilitas <span class="text-brand-300">(pisah koma)</span></label><input v-model="form.facilities" class="input" placeholder="AC, Smart TV, Netflix, KM dalam" /></div>
        <div class="flex justify-end gap-2 pt-2"><button type="button" class="btn-ghost" @click="open = false">Batal</button><button type="submit" class="btn-primary">Simpan</button></div>
      </form>
    </ModalDialog>
  </div>
</template>
