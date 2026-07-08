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
const customFac = ref('')

const FACILITY_PRESETS = ['AC', 'Smart TV', 'Netflix', 'WiFi cepat', 'KM dalam', 'Air panas', 'Water heater', 'Shower', 'Kulkas mini', 'Meja kerja', 'Sofa', 'Bathtub', 'City view', 'Handuk', 'Sarapan', 'Parkir', 'Kipas', 'Lemari']
const CLASS_PRESETS = {
  Standard: { '3j': 40000, '6j': 60000, '12j': 90000, '1h': 130000, '3h': 330000, '1mg': 700000 },
  Deluxe: { '3j': 55000, '6j': 80000, '12j': 120000, '1h': 175000, '3h': 450000, '1mg': 950000 },
  Executive: { '3j': 75000, '6j': 110000, '12j': 160000, '1h': 230000, '3h': 600000, '1mg': 1300000 },
}
const emptyRates = () => ({ ...CLASS_PRESETS.Standard })
const form = reactive({ propertyId: '', number: '', floor: 1, type: 'Standard', capacity: 2, rates: emptyRates(), facilities: ['AC', 'Smart TV', 'Netflix', 'WiFi cepat', 'KM dalam'], description: '' })

const rooms = computed(() => {
  let list = store.scopedRooms
  if (filter.value === 'kosong') list = list.filter((r) => store.roomStatus(r.id) === 'kosong')
  if (filter.value === 'terisi') list = list.filter((r) => store.roomStatus(r.id) === 'terisi')
  return [...list].sort((a, b) => a.propertyId.localeCompare(b.propertyId) || a.number.localeCompare(b.number))
})

function fill(r) {
  Object.assign(form, {
    propertyId: r?.propertyId || store.activePropertyId || store.properties[0]?.id,
    number: r?.number || '',
    floor: r?.floor || 1,
    type: r?.type || 'Standard',
    capacity: r?.capacity || 2,
    rates: { ...emptyRates(), ...(r?.rates || {}) },
    facilities: r ? [...r.facilities] : ['AC', 'Smart TV', 'Netflix', 'WiFi cepat', 'KM dalam'],
    description: r?.description || '',
  })
  customFac.value = ''
}
function openCreate() { editId.value = null; fill(null); open.value = true }
function openEdit(r) { editId.value = r.id; fill(r); open.value = true }
function duplicate(r) { editId.value = null; fill(r); form.number = ''; open.value = true }

function applyClassPreset() {
  if (CLASS_PRESETS[form.type]) form.rates = { ...CLASS_PRESETS[form.type] }
}
function toggleFac(f) {
  const i = form.facilities.indexOf(f)
  if (i >= 0) form.facilities.splice(i, 1)
  else form.facilities.push(f)
}
function addCustomFac() {
  const v = customFac.value.trim()
  if (v && !form.facilities.includes(v)) form.facilities.push(v)
  customFac.value = ''
}

function save() {
  if (!form.number.trim()) return
  const rates = {}
  for (const d of DURATIONS) rates[d.key] = Number(form.rates[d.key]) || 0
  const payload = { propertyId: form.propertyId, number: form.number.trim(), type: form.type, floor: Number(form.floor) || 1, capacity: Number(form.capacity) || 1, rates, facilities: [...form.facilities], description: form.description.trim() }
  if (editId.value) store.updateRoom(editId.value, payload)
  else store.addRoom(payload)
  open.value = false
}
function del(r) {
  if (!confirm(`Hapus Kamar ${r.number}?`)) return
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

    <div class="mb-4 flex gap-1 rounded-xl bg-surface p-1 ring-1 ring-line shadow-sm sm:inline-flex">
      <button v-for="f in [['semua', 'Semua'], ['kosong', 'Kosong'], ['terisi', 'Terisi']]" :key="f[0]"
        class="flex-1 rounded-lg px-4 py-2 text-sm font-semibold transition sm:flex-none" :class="filter === f[0] ? 'bg-brand-600 text-white shadow-sm' : 'text-brand-400 hover:text-brand-600'" @click="filter = f[0]">{{ f[1] }}</button>
    </div>

    <div v-if="!rooms.length" class="card flex flex-col items-center justify-center px-6 py-16 text-center">
      <span class="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50 text-brand-500"><Icon name="door" :size="26" /></span>
      <h3 class="mt-4 font-display text-lg font-bold text-brand-800">Belum ada kamar</h3>
      <p class="mt-1 max-w-sm text-sm text-brand-400">Tambahkan kamar pertama — lengkap dengan harga per durasi, fasilitas, dan deskripsi. Setelah itu bisa diduplikat untuk buat kamar serupa dengan cepat.</p>
      <button class="btn-primary mt-5" @click="openCreate"><Icon name="plus" :size="16" /> Tambah Kamar</button>
    </div>

    <div class="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
      <div v-for="r in rooms" :key="r.id" class="card group p-5">
        <div class="flex items-start justify-between">
          <div>
            <p class="font-display text-xl font-bold text-brand-800">Kamar {{ r.number }}</p>
            <p class="text-xs text-brand-400">{{ store.propertyById(r.propertyId)?.name }} · Lt. {{ r.floor }} · {{ r.capacity || 2 }} tamu</p>
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

        <p v-if="r.description" class="mt-3 line-clamp-2 text-xs leading-relaxed text-brand-400">{{ r.description }}</p>

        <div class="mt-3 flex flex-wrap gap-1.5">
          <span v-for="f in r.facilities.slice(0, 5)" :key="f" class="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] text-brand-500">{{ f }}</span>
          <span v-if="r.facilities.length > 5" class="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] text-brand-400">+{{ r.facilities.length - 5 }}</span>
        </div>

        <div class="mt-4 flex gap-2 border-t border-brand-700/5 pt-3">
          <button class="btn-outline flex-1 py-2" @click="openEdit(r)"><Icon name="edit" :size="15" /> Edit</button>
          <button class="btn-ghost px-3 py-2" title="Duplikat kamar ini" @click="duplicate(r)"><Icon name="plus" :size="15" /> Duplikat</button>
          <button class="btn px-3 py-2 text-rose-500 hover:bg-rose-50" title="Hapus" @click="del(r)"><Icon name="trash" :size="15" /></button>
        </div>
      </div>
    </div>

    <ModalDialog :open="open" :title="editId ? 'Edit Kamar' : 'Tambah Kamar'" :subtitle="editId ? 'Perbarui detail kamar' : 'Isi detail kamar baru'" @close="open = false">
      <form class="space-y-5" @submit.prevent="save">
        <div><label class="label">Properti</label><select v-model="form.propertyId" class="input"><option v-for="p in store.properties" :key="p.id" :value="p.id">{{ p.name }}</option></select></div>

        <div class="grid grid-cols-2 gap-3 sm:grid-cols-4">
          <div><label class="label">Nomor</label><input v-model="form.number" class="input" placeholder="101" /></div>
          <div><label class="label">Lantai</label><input v-model.number="form.floor" type="number" min="1" class="input" /></div>
          <div><label class="label">Kapasitas</label><input v-model.number="form.capacity" type="number" min="1" class="input" /></div>
          <div><label class="label">Kelas</label><select v-model="form.type" class="input" @change="applyClassPreset"><option>Standard</option><option>Deluxe</option><option>Executive</option></select></div>
        </div>

        <div>
          <div class="mb-1.5 flex items-center justify-between">
            <label class="label mb-0">Harga per durasi</label>
            <button type="button" class="text-xs font-semibold text-brand-600 hover:underline" @click="applyClassPreset">Isi otomatis dari kelas {{ form.type }}</button>
          </div>
          <div class="grid grid-cols-2 gap-2 sm:grid-cols-3">
            <div v-for="d in DURATIONS" :key="d.key" class="rounded-xl bg-brand-50/60 p-2">
              <span class="block text-[11px] font-medium text-brand-500">{{ d.label }}</span>
              <div class="flex items-center gap-1"><span class="text-xs text-brand-300">Rp</span><input v-model.number="form.rates[d.key]" type="number" step="5000" class="w-full bg-transparent text-sm font-semibold text-brand-800 focus:outline-none" /></div>
            </div>
          </div>
        </div>

        <div>
          <label class="label">Fasilitas <span class="text-brand-300">({{ form.facilities.length }} dipilih)</span></label>
          <div class="flex flex-wrap gap-1.5">
            <button v-for="f in FACILITY_PRESETS" :key="f" type="button" @click="toggleFac(f)"
              class="chip border transition" :class="form.facilities.includes(f) ? 'border-brand-600 bg-brand-600 text-white' : 'border-brand-200 bg-white text-brand-500 hover:border-brand-300'">
              <Icon v-if="form.facilities.includes(f)" name="check" :size="12" /> {{ f }}
            </button>
          </div>
          <div v-if="form.facilities.some((f) => !FACILITY_PRESETS.includes(f))" class="mt-2 flex flex-wrap gap-1.5">
            <button v-for="f in form.facilities.filter((x) => !FACILITY_PRESETS.includes(x))" :key="f" type="button" @click="toggleFac(f)" class="chip border border-gold-500 bg-gold-300/25 text-gold-600"><Icon name="x" :size="12" /> {{ f }}</button>
          </div>
          <div class="mt-2 flex gap-2">
            <input v-model="customFac" class="input py-2 text-sm" placeholder="Tambah fasilitas lain…" @keydown.enter.prevent="addCustomFac" />
            <button type="button" class="btn-outline shrink-0 px-3 py-2" @click="addCustomFac"><Icon name="plus" :size="15" /></button>
          </div>
        </div>

        <div>
          <label class="label">Deskripsi <span class="text-brand-300">(tampil di halaman kamar)</span></label>
          <textarea v-model="form.description" rows="3" class="input resize-none" placeholder="Ceritakan keunggulan kamar ini: suasana, view, cocok untuk siapa, dll." />
        </div>

        <div class="flex justify-end gap-2 border-t border-brand-700/5 pt-3"><button type="button" class="btn-ghost" @click="open = false">Batal</button><button type="submit" class="btn-primary"><Icon name="check" :size="16" /> {{ editId ? 'Simpan Perubahan' : 'Tambah Kamar' }}</button></div>
      </form>
    </ModalDialog>
  </div>
</template>
