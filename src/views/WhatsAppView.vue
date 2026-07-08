<script setup>
import { computed, reactive, ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import { useKostStore } from '../stores/kost'
import { tanggal } from '../utils/format'
import PageHeader from '../components/PageHeader.vue'
import ModalDialog from '../components/ModalDialog.vue'
import Avatar from '../components/Avatar.vue'
import Icon from '../components/Icon.vue'

const store = useKostStore()
const route = useRoute()

const mode = ref('channel') // channel | personal
const compose = reactive({ title: '', message: '', audience: 'Semua Penghuni', customerId: '', channel: 'Channel' })
const sent = ref(false)
const tplOpen = ref(false)
const tplForm = reactive({ name: '', body: '' })

const audiences = computed(() => [
  'Semua Penghuni',
  'Penghuni Aktif',
  'Tunggakan',
  ...store.properties.map((p) => p.name),
])

const recipientCount = computed(() => {
  if (mode.value === 'personal') return compose.customerId ? 1 : 0
  const a = compose.audience
  if (a === 'Penghuni Aktif') return store.activeBookings.length
  if (a === 'Tunggakan') return store.activeBookings.filter((b) => !b.paid).length
  if (store.properties.some((p) => p.name === a)) {
    const prop = store.properties.find((p) => p.name === a)
    return store.activeBookings.filter((b) => store.propertyOfRoom(b.roomId)?.id === prop.id).length
  }
  return store.customers.length
})

onMounted(() => {
  if (route.query.to) {
    mode.value = 'personal'
    compose.customerId = route.query.to
  }
})

function applyTemplate(t) {
  compose.message = t.body
  if (!compose.title) compose.title = t.name
}
function send() {
  if (!compose.message.trim() || !recipientCount.value) return
  store.sendBroadcast({
    title: compose.title || (mode.value === 'personal' ? 'Pesan Personal' : 'Broadcast'),
    message: compose.message,
    audience: mode.value === 'personal' ? store.customerById(compose.customerId)?.name : compose.audience,
    channel: mode.value === 'personal' ? 'Personal' : compose.channel,
    recipients: recipientCount.value,
  })
  sent.value = true
  compose.message = ''
  compose.title = ''
  setTimeout(() => (sent.value = false), 2500)
}
function saveTpl() {
  if (!tplForm.name.trim() || !tplForm.body.trim()) return
  store.addTemplate({ ...tplForm })
  tplForm.name = ''
  tplForm.body = ''
  tplOpen.value = false
}
</script>

<template>
  <div>
    <PageHeader title="WhatsApp Center" subtitle="Broadcast channel & pesan personal ke penghuni">
      <template #actions>
        <span class="chip" :class="store.settings.waConnected ? 'bg-emerald-50 text-emerald-600' : 'bg-gold-300/25 text-gold-600'">
          <span class="h-2 w-2 rounded-full" :class="store.settings.waConnected ? 'bg-emerald-500' : 'bg-gold-500'" />
          {{ store.settings.waConnected ? 'API Terhubung' : 'API Belum Terhubung' }}
        </span>
      </template>
    </PageHeader>

    <!-- Connection banner -->
    <div v-if="!store.settings.waConnected" class="mb-4 flex flex-col gap-3 rounded-2xl bg-brand-700 p-5 text-white sm:flex-row sm:items-center">
      <span class="flex h-11 w-11 items-center justify-center rounded-xl bg-emerald-500/90"><Icon name="message" :size="22" /></span>
      <div class="flex-1">
        <p class="font-semibold">Hubungkan WhatsApp Business API</p>
        <p class="text-sm text-brand-200">Integrasikan Meta Cloud API untuk mengirim broadcast & pesan otomatis ke penghuni. Konfigurasi di Pengaturan.</p>
      </div>
      <RouterLink to="/pengaturan" class="btn-gold whitespace-nowrap">Hubungkan Sekarang</RouterLink>
    </div>

    <div class="grid gap-4 lg:grid-cols-3">
      <!-- Composer -->
      <div class="card p-5 lg:col-span-2">
        <div class="mb-4 inline-flex rounded-xl bg-brand-50 p-1">
          <button class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition" :class="mode === 'channel' ? 'bg-white text-brand-600 shadow-sm' : 'text-brand-400'" @click="mode = 'channel'"><Icon name="megaphone" :size="15" /> Broadcast Channel</button>
          <button class="flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-semibold transition" :class="mode === 'personal' ? 'bg-white text-brand-600 shadow-sm' : 'text-brand-400'" @click="mode = 'personal'"><Icon name="message" :size="15" /> Pesan Personal</button>
        </div>

        <div class="space-y-4">
          <div v-if="mode === 'channel'" class="grid gap-3 sm:grid-cols-2">
            <div><label class="label">Audiens</label><select v-model="compose.audience" class="input"><option v-for="a in audiences" :key="a">{{ a }}</option></select></div>
            <div><label class="label">Kanal pengiriman</label><select v-model="compose.channel" class="input"><option>Channel</option><option>Grup</option><option>Status</option></select></div>
          </div>
          <div v-else><label class="label">Kirim ke penghuni</label><select v-model="compose.customerId" class="input"><option value="">Pilih penghuni…</option><option v-for="c in store.customers" :key="c.id" :value="c.id">{{ c.name }} · {{ c.phone }}</option></select></div>

          <div><label class="label">Judul (internal)</label><input v-model="compose.title" class="input" placeholder="mis. Promo Sewa Bulanan" /></div>

          <div>
            <div class="mb-1.5 flex items-center justify-between">
              <label class="label mb-0">Pesan</label>
              <div class="flex flex-wrap gap-1">
                <button v-for="v in ['{nama}', '{kamar}', '{properti}', '{total}']" :key="v" type="button" class="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] font-medium text-brand-500 hover:bg-brand-100" @click="compose.message += ' ' + v">{{ v }}</button>
              </div>
            </div>
            <textarea v-model="compose.message" rows="5" class="input resize-none" placeholder="Tulis pesan WhatsApp… gunakan variabel seperti {nama} untuk personalisasi 🌿" />
          </div>

          <div class="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-brand-50/60 px-4 py-3">
            <span class="flex items-center gap-2 text-sm text-brand-500"><Icon name="users" :size="16" /> <b class="text-brand-800">{{ recipientCount }}</b> penerima</span>
            <button class="btn-primary bg-emerald-600 hover:bg-emerald-500" :disabled="!compose.message.trim() || !recipientCount" @click="send"><Icon name="send" :size="16" /> Kirim {{ mode === 'personal' ? 'Pesan' : 'Broadcast' }}</button>
          </div>
          <Transition enter-active-class="transition" enter-from-class="opacity-0 -translate-y-1">
            <p v-if="sent" class="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-2.5 text-sm font-medium text-emerald-600"><Icon name="checkCircle" :size="16" /> Terkirim ke {{ store.broadcasts[0]?.recipients }} penerima!</p>
          </Transition>
        </div>
      </div>

      <!-- Templates -->
      <div class="card flex flex-col p-5">
        <div class="mb-3 flex items-center justify-between">
          <h2 class="font-display text-lg font-bold text-brand-800">Template</h2>
          <button class="btn-ghost px-2 py-1 text-xs" @click="tplOpen = true"><Icon name="plus" :size="14" /> Baru</button>
        </div>
        <div class="space-y-2">
          <button v-for="t in store.templates" :key="t.id" class="group w-full rounded-xl border border-brand-700/5 p-3 text-left transition hover:border-brand-200 hover:bg-brand-50/50" @click="applyTemplate(t)">
            <p class="flex items-center justify-between text-sm font-semibold text-brand-800">{{ t.name }} <Icon name="arrowRight" :size="14" class="text-brand-300 group-hover:text-brand-600" /></p>
            <p class="mt-0.5 line-clamp-2 text-xs text-brand-400">{{ t.body }}</p>
          </button>
        </div>
      </div>
    </div>

    <!-- History -->
    <div class="mt-4 card overflow-hidden">
      <h2 class="px-5 py-4 font-display text-lg font-bold text-brand-800">Riwayat Broadcast</h2>
      <div class="divide-y divide-brand-700/5">
        <div v-for="b in store.broadcasts" :key="b.id" class="flex items-start gap-3 px-5 py-4 hover:bg-brand-50/40">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl" :class="b.channel === 'Personal' ? 'bg-brand-50 text-brand-600' : 'bg-emerald-50 text-emerald-600'"><Icon :name="b.channel === 'Personal' ? 'message' : 'megaphone'" :size="18" /></span>
          <div class="min-w-0 flex-1">
            <p class="flex items-center gap-2 font-medium text-brand-800">{{ b.title }}
              <span class="chip" :class="b.status === 'terkirim' ? 'bg-emerald-50 text-emerald-600' : 'bg-gold-300/25 text-gold-600'">{{ b.status }}</span></p>
            <p class="line-clamp-1 text-sm text-brand-400">{{ b.message }}</p>
            <p class="mt-1 text-xs text-brand-300">{{ b.audience }} · {{ b.recipients }} penerima · {{ tanggal(b.date) }}</p>
          </div>
        </div>
      </div>
    </div>

    <ModalDialog :open="tplOpen" title="Template Pesan Baru" @close="tplOpen = false">
      <form class="space-y-4" @submit.prevent="saveTpl">
        <div><label class="label">Nama template</label><input v-model="tplForm.name" class="input" placeholder="mis. Reminder Pembayaran" /></div>
        <div><label class="label">Isi pesan</label><textarea v-model="tplForm.body" rows="4" class="input resize-none" placeholder="Gunakan {nama}, {kamar}, {total}…" /></div>
        <div class="flex justify-end gap-2"><button type="button" class="btn-ghost" @click="tplOpen = false">Batal</button><button type="submit" class="btn-primary">Simpan</button></div>
      </form>
    </ModalDialog>
  </div>
</template>
