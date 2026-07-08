<script setup>
import { reactive, ref } from 'vue'
import { useKostStore, AREAS } from '../stores/kost'
import { rupiahShort } from '../utils/format'
import PageHeader from '../components/PageHeader.vue'
import ModalDialog from '../components/ModalDialog.vue'
import Icon from '../components/Icon.vue'

const store = useKostStore()
const open = ref(false)
const editId = ref(null)
const form = reactive({ name: '', area: AREAS[0], address: '', phone: '', type: 'Campur', hue: 158 })

function openCreate() {
  editId.value = null
  Object.assign(form, { name: '', area: AREAS[0], address: '', phone: '', type: 'Campur', hue: 150 + Math.floor(Math.random() * 30) })
  open.value = true
}
function openEdit(p) {
  editId.value = p.id
  Object.assign(form, { name: p.name, area: p.area, address: p.address, phone: p.phone, type: p.type, hue: p.hue })
  open.value = true
}
function save() {
  if (!form.name.trim()) return
  if (editId.value) store.updateProperty(editId.value, { ...form })
  else store.addProperty({ ...form })
  open.value = false
}
function del(p) {
  const res = store.removeProperty(p.id)
  if (!res.ok) alert(res.msg)
}
function stats(id) {
  return store.occupancyByProperty.find((p) => p.id === id)
}
</script>

<template>
  <div>
    <PageHeader title="Properti" :subtitle="`${store.properties.length} cabang kos tersebar di Pontianak`">
      <template #actions>
        <button class="btn-primary" @click="openCreate"><Icon name="plus" :size="16" /> Tambah Properti</button>
      </template>
    </PageHeader>

    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <article v-for="p in store.properties" :key="p.id" class="card group overflow-hidden">
        <!-- Cover -->
        <div class="relative h-28" :style="{ background: `linear-gradient(135deg, hsl(${p.hue} 42% 34%), hsl(${p.hue} 55% 22%))` }">
          <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 20% 30%, white 1px, transparent 1px); background-size: 22px 22px;" />
          <span class="absolute top-3 left-3 chip bg-white/15 text-white backdrop-blur"><Icon name="clock" :size="12" /> Kos Singgah</span>
          <span class="absolute top-3 right-3 chip bg-gold-500 text-brand-900"><Icon name="star" :size="12" /> {{ p.rating }}</span>
          <div class="absolute bottom-3 left-4 text-white">
            <p class="flex items-center gap-1 text-[11px] text-white/80"><Icon name="mapPin" :size="12" /> {{ p.area }}</p>
          </div>
        </div>
        <div class="p-5">
          <h3 class="font-display text-lg font-bold text-brand-800">{{ p.name }}</h3>
          <p class="mt-0.5 flex items-center gap-1 text-xs text-brand-400"><Icon name="home" :size="12" /> {{ p.address }}</p>

          <div class="mt-4 flex items-center justify-between text-sm">
            <div>
              <p class="text-xs text-brand-400">Hunian</p>
              <p class="font-semibold text-brand-800">{{ stats(p.id)?.filled }}/{{ stats(p.id)?.rooms }} kamar</p>
            </div>
            <div class="text-right">
              <p class="text-xs text-brand-400">Okupansi</p>
              <p class="font-display text-lg font-bold" :class="stats(p.id)?.rate >= 70 ? 'text-brand-600' : 'text-gold-600'">{{ stats(p.id)?.rate }}%</p>
            </div>
          </div>
          <div class="mt-2 h-2 overflow-hidden rounded-full bg-brand-50">
            <div class="h-full rounded-full bg-brand-500 transition-all" :style="{ width: stats(p.id)?.rate + '%' }" />
          </div>

          <div class="mt-4 flex gap-2 border-t border-brand-700/5 pt-3">
            <button class="btn-outline flex-1 py-2" @click="store.activePropertyId = p.id; $router.push('/app/kamar')"><Icon name="eye" :size="15" /> Kelola</button>
            <button class="btn-ghost px-3 py-2" @click="openEdit(p)"><Icon name="edit" :size="15" /></button>
            <button class="btn px-3 py-2 text-rose-500 hover:bg-rose-50" @click="del(p)"><Icon name="trash" :size="15" /></button>
          </div>
        </div>
      </article>
    </div>

    <ModalDialog :open="open" :title="editId ? 'Edit Properti' : 'Tambah Properti'" subtitle="Cabang kos di Pontianak" @close="open = false">
      <form class="space-y-4" @submit.prevent="save">
        <div><label class="label">Nama properti</label><input v-model="form.name" class="input" placeholder="mis. Green Garden Residence" /></div>
        <div><label class="label">Area</label><select v-model="form.area" class="input"><option v-for="a in AREAS" :key="a">{{ a }}</option></select></div>
        <div><label class="label">Alamat</label><input v-model="form.address" class="input" placeholder="Jl. ..." /></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="label">Telepon</label><input v-model="form.phone" class="input" placeholder="0561-..." /></div>
          <div><label class="label">Warna tema</label><input v-model.number="form.hue" type="range" min="120" max="200" class="w-full accent-brand-600" /></div>
        </div>
        <div class="flex justify-end gap-2 pt-2">
          <button type="button" class="btn-ghost" @click="open = false">Batal</button>
          <button type="submit" class="btn-primary">Simpan</button>
        </div>
      </form>
    </ModalDialog>
  </div>
</template>
