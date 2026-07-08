<script setup>
import { computed, reactive, ref } from 'vue'
import { useRoute, useRouter, RouterLink } from 'vue-router'
import { useKostStore, DURATIONS, durationByKey, todayStr, addHours } from '../../stores/kost'
import { rupiah, tanggalWaktu } from '../../utils/format'
import PhotoBox from '../../components/public/PhotoBox.vue'
import Icon from '../../components/Icon.vue'

const store = useKostStore()
const route = useRoute()
const router = useRouter()

const room = computed(() => { const r = store.roomById(route.params.id); return r ? store.enrichRoom(r) : null })
const step = ref(1)
const submitting = ref(false)
const err = ref('')

const defaultTime = () => `${String(Math.min(23, new Date().getHours() + 1)).padStart(2, '0')}:00`
const data = reactive({
  date: route.query.date || todayStr(),
  time: route.query.time || defaultTime(),
  durasi: route.query.durasi || '6j',
  guests: Number(route.query.guests) || 1,
  name: '', phone: '', email: '', notes: '', payment: 'Bayar di tempat',
})
const checkInAt = computed(() => `${data.date}T${data.time}`)
const dur = computed(() => durationByKey(data.durasi))
const checkOutAt = computed(() => addHours(checkInAt.value, dur.value.hours))
const total = computed(() => (room.value ? (room.value.rates?.[data.durasi] ?? room.value.dailyRate) : 0))
const available = computed(() => room.value && store.isRoomAvailable(room.value.id, checkInAt.value, data.durasi))
const validStep1 = computed(() => data.name.trim().length > 2 && data.phone.trim().length >= 8 && available.value)

function next() {
  err.value = ''
  if (!available.value) { err.value = 'Kamar tidak tersedia untuk waktu tersebut.'; return }
  if (!validStep1.value) { err.value = 'Lengkapi nama & nomor HP.'; return }
  step.value = 2
  window.scrollTo({ top: 0, behavior: 'smooth' })
}
function confirm() {
  submitting.value = true
  const res = store.createGuestBooking({ roomId: room.value.id, name: data.name.trim(), phone: data.phone.trim(), email: data.email.trim(), checkInAt: checkInAt.value, durationKey: data.durasi, guests: data.guests })
  submitting.value = false
  if (!res.ok) { err.value = res.msg; step.value = 1; return }
  router.push({ path: '/booking/sukses', query: { code: res.code, roomId: room.value.id, date: data.date, time: data.time, durasi: data.durasi, name: data.name.trim(), payment: data.payment } })
}
</script>

<template>
  <div v-if="room" class="pt-24 pb-16">
    <div class="mx-auto max-w-5xl px-5">
      <RouterLink :to="`/kamar/${room.id}`" class="mb-4 inline-flex items-center gap-1.5 text-sm font-medium text-muted hover:text-strong"><Icon name="chevronRight" :size="15" class="rotate-180" /> Kembali ke detail</RouterLink>

      <div class="mb-8 flex items-center gap-2">
        <div v-for="s in [{ n: 1, t: 'Data Tamu' }, { n: 2, t: 'Konfirmasi' }]" :key="s.n" class="flex flex-1 items-center gap-2 last:flex-none">
          <span class="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-sm font-bold transition" :class="step >= s.n ? 'bg-brand-600 text-white' : 'bg-brand-100 text-soft'"><Icon v-if="step > s.n" name="check" :size="16" /><template v-else>{{ s.n }}</template></span>
          <span class="text-sm font-semibold" :class="step >= s.n ? 'text-ink' : 'text-soft'">{{ s.t }}</span>
          <span v-if="s.n === 1" class="mx-2 h-0.5 flex-1 rounded-full transition-colors" :class="step > 1 ? 'bg-brand-600' : 'bg-brand-100'" />
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[1fr_340px]">
        <div>
          <Transition name="page" mode="out-in">
            <div v-if="step === 1" key="1" class="card p-6">
              <h2 class="font-display text-xl font-bold text-ink">Detail Sewa</h2>
              <div class="mt-4">
                <p class="mb-2 text-sm font-medium text-accent">Durasi</p>
                <div class="grid grid-cols-3 gap-2 sm:grid-cols-6">
                  <button v-for="d in DURATIONS" :key="d.key" type="button" @click="data.durasi = d.key" class="rounded-xl border-2 px-1.5 py-2 text-center transition" :class="data.durasi === d.key ? 'border-brand-600 bg-tint/60' : 'border-line hover:border-line'">
                    <span class="block text-xs font-semibold text-ink">{{ d.label }}</span>
                    <span class="block text-[11px] font-bold text-accent">{{ rupiah(room.rates?.[d.key] ?? room.dailyRate) }}</span>
                  </button>
                </div>
              </div>
              <div class="mt-4 grid grid-cols-2 gap-3">
                <label><span class="label">Tanggal masuk</span><input v-model="data.date" type="date" :min="todayStr()" class="input" /></label>
                <label><span class="label">Jam masuk</span><input v-model="data.time" type="time" class="input" /></label>
              </div>
              <label class="mt-3 block"><span class="label">Jumlah tamu</span><select v-model.number="data.guests" class="input"><option v-for="n in 4" :key="n" :value="n">{{ n }} orang</option></select></label>

              <h2 class="mt-7 font-display text-xl font-bold text-ink">Data Tamu</h2>
              <p class="text-sm text-soft">Tanpa perlu akun — cukup nama & nomor HP.</p>
              <div class="mt-4 space-y-3">
                <label class="block"><span class="label">Nama lengkap <span class="text-rose-400">*</span></span><input v-model="data.name" class="input" placeholder="Nama sesuai identitas" /></label>
                <div class="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <label class="block"><span class="label">Nomor HP / WhatsApp <span class="text-rose-400">*</span></span><input v-model="data.phone" type="tel" class="input" placeholder="0812xxxxxxxx" /></label>
                  <label class="block"><span class="label">Email <span class="text-soft">(opsional)</span></span><input v-model="data.email" type="email" class="input" placeholder="email@contoh.com" /></label>
                </div>
                <label class="block"><span class="label">Catatan <span class="text-soft">(opsional)</span></span><textarea v-model="data.notes" rows="2" class="input resize-none" placeholder="mis. perkiraan jam tiba" /></label>
              </div>
              <p v-if="err" class="mt-3 text-sm font-medium text-rose-500">{{ err }}</p>
              <button class="btn-primary mt-5 w-full py-3 text-base" :disabled="!validStep1" @click="next">Lanjut ke Konfirmasi <Icon name="arrowRight" :size="18" /></button>
            </div>

            <div v-else key="2" class="space-y-4">
              <div class="card p-6">
                <h2 class="font-display text-xl font-bold text-ink">Metode Pembayaran</h2>
                <div class="mt-4 space-y-2.5">
                  <label v-for="m in ['Bayar di tempat', 'Transfer Bank', 'QRIS']" :key="m" class="flex cursor-pointer items-center gap-3 rounded-xl border-2 p-4 transition" :class="data.payment === m ? 'border-brand-600 bg-tint/50' : 'border-line hover:border-line'">
                    <input type="radio" v-model="data.payment" :value="m" class="accent-brand-600" />
                    <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-tint text-accent"><Icon :name="m === 'QRIS' ? 'qr' : m === 'Transfer Bank' ? 'wallet' : 'money'" :size="18" /></span>
                    <span class="flex-1"><span class="block text-sm font-semibold text-ink">{{ m }}</span><span class="block text-xs text-soft">{{ m === 'Bayar di tempat' ? 'Bayar tunai saat check-in' : m === 'Transfer Bank' ? 'Instruksi via WhatsApp' : 'Scan & bayar instan' }}</span></span>
                  </label>
                </div>
              </div>
              <div class="card p-6">
                <h2 class="font-display text-xl font-bold text-ink">Ringkasan Tamu</h2>
                <dl class="mt-3 space-y-2 text-sm">
                  <div class="flex justify-between"><dt class="text-soft">Nama</dt><dd class="font-medium text-ink">{{ data.name }}</dd></div>
                  <div class="flex justify-between"><dt class="text-soft">HP</dt><dd class="font-medium text-ink">{{ data.phone }}</dd></div>
                  <div v-if="data.email" class="flex justify-between"><dt class="text-soft">Email</dt><dd class="font-medium text-ink">{{ data.email }}</dd></div>
                  <div class="flex justify-between"><dt class="text-soft">Tamu</dt><dd class="font-medium text-ink">{{ data.guests }} orang</dd></div>
                </dl>
              </div>
              <p v-if="err" class="text-sm font-medium text-rose-500">{{ err }}</p>
              <div class="flex gap-3">
                <button class="btn-outline flex-1 py-3" @click="step = 1">Kembali</button>
                <button class="btn-primary flex-[2] py-3 text-base" :disabled="submitting" @click="confirm"><Icon v-if="!submitting" name="checkCircle" :size="18" /> {{ submitting ? 'Memproses…' : 'Konfirmasi Pesanan' }}</button>
              </div>
            </div>
          </Transition>
        </div>

        <div>
          <div class="sticky top-24 card-lg overflow-hidden">
            <div class="h-32"><PhotoBox :seed="room.id" :hue="room.property?.hue" :w="600" :h="300" /></div>
            <div class="p-5">
              <span class="chip bg-tint text-accent">{{ room.type }}</span>
              <h3 class="mt-2 font-display text-lg font-bold text-ink">{{ room.property?.name }}</h3>
              <p class="flex items-center gap-1 text-xs text-soft"><Icon name="mapPin" :size="12" /> Kamar {{ room.number }} · {{ room.area }}</p>
              <div class="mt-4 space-y-2 rounded-xl bg-tint/60 p-3 text-sm">
                <div class="flex justify-between"><span class="text-soft">Durasi</span><span class="font-semibold text-ink">{{ dur.label }}</span></div>
                <div class="flex justify-between"><span class="text-soft">Masuk</span><span class="font-medium text-ink">{{ tanggalWaktu(checkInAt) }}</span></div>
                <div class="flex justify-between"><span class="text-soft">Selesai</span><span class="font-medium text-ink">{{ tanggalWaktu(checkOutAt) }}</span></div>
              </div>
              <div class="mt-4 flex items-center justify-between border-t border-line pt-3"><span class="text-sm font-semibold text-ink">Total</span><span class="font-display text-xl font-bold text-strong">{{ rupiah(total) }}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  <div v-else class="flex min-h-[60vh] flex-col items-center justify-center pt-24 text-center">
    <h1 class="font-display text-2xl font-bold text-ink">Kamar tidak ditemukan</h1>
    <RouterLink to="/cari" class="btn-primary mt-4">Cari kamar lain</RouterLink>
  </div>
</template>
