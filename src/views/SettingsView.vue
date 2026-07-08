<script setup>
import { reactive, ref } from 'vue'
import { useKostStore } from '../stores/kost'
import PageHeader from '../components/PageHeader.vue'
import Icon from '../components/Icon.vue'

const store = useKostStore()
const wa = reactive({
  provider: store.settings.waProvider,
  number: store.settings.waNumber,
  phoneId: '',
  token: '',
  webhook: 'https://api.dailykost.id/webhook/wa',
})
const saved = ref('')

function saveProfile() {
  saved.value = 'profile'
  setTimeout(() => (saved.value = ''), 2000)
}
function connectWa() {
  store.settings.waConnected = true
  store.settings.waNumber = wa.number || '+62 812-0000-0000'
  store.settings.waProvider = wa.provider
  saved.value = 'wa'
  setTimeout(() => (saved.value = ''), 2000)
}
function disconnectWa() {
  store.settings.waConnected = false
}
function reset() {
  if (confirm('Reset semua data ke contoh awal? Data saat ini akan hilang.')) store.resetData()
}
</script>

<template>
  <div>
    <PageHeader title="Pengaturan" subtitle="Profil bisnis, integrasi WhatsApp, dan preferensi sistem" />

    <div class="grid gap-4 lg:grid-cols-2">
      <!-- Business profile -->
      <div class="card p-5">
        <h2 class="mb-4 flex items-center gap-2 font-display text-lg font-bold text-brand-800"><Icon name="building" :size="18" class="text-brand-500" /> Profil Bisnis</h2>
        <div class="space-y-4">
          <div><label class="label">Nama bisnis</label><input v-model="store.settings.businessName" class="input" /></div>
          <div><label class="label">Nama pemilik</label><input v-model="store.settings.ownerName" class="input" /></div>
          <div><label class="label">Mata uang</label><input :value="store.settings.currency" class="input" disabled /></div>
          <button class="btn-primary" @click="saveProfile"><Icon name="check" :size="16" /> Simpan Profil</button>
          <p v-if="saved === 'profile'" class="text-sm font-medium text-emerald-600">✓ Profil tersimpan</p>
        </div>
      </div>

      <!-- WhatsApp API -->
      <div class="card p-5">
        <h2 class="mb-1 flex items-center gap-2 font-display text-lg font-bold text-brand-800"><Icon name="message" :size="18" class="text-emerald-600" /> Integrasi WhatsApp API</h2>
        <p class="mb-4 text-sm text-brand-400">Untuk broadcast channel & pesan otomatis ke penghuni.</p>

        <div v-if="store.settings.waConnected" class="mb-4 flex items-center gap-3 rounded-xl bg-emerald-50 p-4">
          <span class="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500 text-white"><Icon name="checkCircle" :size="20" /></span>
          <div class="flex-1"><p class="font-semibold text-emerald-700">Terhubung</p><p class="text-xs text-emerald-600">{{ store.settings.waNumber }} · {{ store.settings.waProvider }}</p></div>
          <button class="btn-outline py-2 text-rose-500" @click="disconnectWa">Putuskan</button>
        </div>

        <div class="space-y-4">
          <div><label class="label">Provider API</label><select v-model="wa.provider" class="input"><option>Meta Cloud API</option><option>Twilio</option><option>Fonnte</option><option>Wablas</option></select></div>
          <div class="grid grid-cols-2 gap-3">
            <div><label class="label">Nomor WhatsApp</label><input v-model="wa.number" class="input" placeholder="+62 812-..." /></div>
            <div><label class="label">Phone Number ID</label><input v-model="wa.phoneId" class="input" placeholder="10987xxxx" /></div>
          </div>
          <div><label class="label">Access Token</label><input v-model="wa.token" type="password" class="input" placeholder="EAAG..." /></div>
          <div><label class="label">Webhook URL</label><input v-model="wa.webhook" class="input font-mono text-xs" readonly /></div>
          <button class="btn-primary bg-emerald-600 hover:bg-emerald-500" @click="connectWa"><Icon name="message" :size="16" /> {{ store.settings.waConnected ? 'Perbarui Koneksi' : 'Hubungkan API' }}</button>
          <p v-if="saved === 'wa'" class="text-sm font-medium text-emerald-600">✓ Konfigurasi tersimpan</p>
        </div>
      </div>

      <!-- Appearance -->
      <div class="card p-5">
        <h2 class="mb-4 flex items-center gap-2 font-display text-lg font-bold text-brand-800"><Icon name="sparkles" :size="18" class="text-gold-500" /> Tampilan</h2>
        <div class="flex items-center gap-3">
          <div class="flex-1 rounded-xl border-2 border-brand-600 p-3">
            <div class="flex gap-1.5"><span class="h-6 w-6 rounded-md bg-brand-700" /><span class="h-6 w-6 rounded-md bg-brand-600" /><span class="h-6 w-6 rounded-md bg-gold-500" /><span class="h-6 w-6 rounded-md bg-cream-100 ring-1 ring-brand-100" /></div>
            <p class="mt-2 text-sm font-semibold text-brand-800">Emerald Luxe</p>
            <p class="text-xs text-brand-400">Hijau tua · Emas · Krem</p>
          </div>
        </div>
      </div>

      <!-- Data -->
      <div class="card p-5">
        <h2 class="mb-4 flex items-center gap-2 font-display text-lg font-bold text-brand-800"><Icon name="settings" :size="18" class="text-brand-500" /> Data & Sistem</h2>
        <p class="mb-3 text-sm text-brand-400">Data tersimpan lokal di browser (localStorage). Kelola ulang data contoh di sini.</p>
        <button class="btn-outline text-rose-500" @click="reset"><Icon name="trash" :size="16" /> Reset ke Data Contoh</button>
        <p class="mt-4 text-xs text-brand-300">Daily Kost Pontianak · v2.0.0 · Emerald Luxe Edition</p>
      </div>
    </div>
  </div>
</template>
