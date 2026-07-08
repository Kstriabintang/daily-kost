<script setup>
import { computed, ref } from 'vue'
import { useKostStore } from '../stores/kost'
import { rupiah, rupiahShort, tanggal } from '../utils/format'
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import Icon from '../components/Icon.vue'

const store = useKostStore()
const method = ref('semua')

const rows = computed(() =>
  store.scopedPayments
    .map((p) => {
      const b = store.bookings.find((x) => x.id === p.bookingId)
      const c = b && store.customerById(b.customerId)
      return { ...p, name: c?.name ?? 'Tamu', room: b && store.roomById(b.roomId)?.number, property: b && store.propertyOfRoom(b.roomId)?.name, invoice: 'INV-' + p.id.slice(-6).toUpperCase() }
    })
    .filter((r) => method.value === 'semua' || r.method === method.value)
    .sort((a, b) => b.date.localeCompare(a.date))
)

const byMethod = (m) => store.scopedPayments.filter((p) => p.method === m).reduce((s, p) => s + p.amount, 0)
const methodIcon = { Transfer: 'wallet', QRIS: 'qr', Tunai: 'money' }
const methodTone = { Transfer: 'bg-brand-50 text-brand-600', QRIS: 'bg-gold-300/25 text-gold-600', Tunai: 'bg-emerald-50 text-emerald-600' }

function exportCsv() {
  const head = ['Invoice', 'Tamu', 'Kamar', 'Metode', 'Tanggal', 'Jumlah']
  const lines = rows.value.map((r) => [r.invoice, r.name, r.room, r.method, r.date, r.amount].join(','))
  const blob = new Blob([[head.join(','), ...lines].join('\n')], { type: 'text/csv' })
  const a = document.createElement('a')
  a.href = URL.createObjectURL(blob)
  a.download = 'pembayaran-daily-kost.csv'
  a.click()
}
</script>

<template>
  <div>
    <PageHeader title="Pembayaran" subtitle="Riwayat transaksi & invoice seluruh cabang">
      <template #actions><button class="btn-outline" @click="exportCsv"><Icon name="download" :size="16" /> Export CSV</button></template>
    </PageHeader>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Total Diterima" :value="rupiahShort(store.totalRevenue)" :sub="`${store.scopedPayments.length} transaksi`" icon="money" tone="brand" />
      <StatCard label="Transfer Bank" :value="rupiahShort(byMethod('Transfer'))" sub="via rekening" icon="wallet" tone="slate" />
      <StatCard label="QRIS" :value="rupiahShort(byMethod('QRIS'))" sub="pembayaran digital" icon="qr" tone="gold" />
      <StatCard label="Tunai" :value="rupiahShort(byMethod('Tunai'))" sub="cash on site" icon="money" tone="emerald" />
    </div>

    <div class="mt-4 mb-3 flex gap-1 overflow-x-auto">
      <button v-for="m in ['semua', 'Transfer', 'QRIS', 'Tunai']" :key="m" class="chip whitespace-nowrap" :class="method === m ? 'bg-brand-600 text-white' : 'bg-white text-brand-500 ring-1 ring-brand-700/5'" @click="method = m">{{ m === 'semua' ? 'Semua Metode' : m }}</button>
    </div>

    <div class="card overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-brand-50/60"><tr><th class="th">Invoice</th><th class="th">Penghuni</th><th class="th">Kamar</th><th class="th">Metode</th><th class="th">Tanggal</th><th class="th text-right">Jumlah</th></tr></thead>
          <tbody class="divide-y divide-brand-700/5">
            <tr v-for="r in rows" :key="r.id" class="hover:bg-brand-50/40">
              <td class="td font-mono text-xs font-medium text-brand-500">{{ r.invoice }}</td>
              <td class="td"><p class="font-medium text-brand-800">{{ r.name }}</p><p class="text-xs text-brand-400">{{ r.property }}</p></td>
              <td class="td text-brand-400">{{ r.room }}</td>
              <td class="td"><span class="chip" :class="methodTone[r.method]"><Icon :name="methodIcon[r.method]" :size="12" /> {{ r.method }}</span></td>
              <td class="td text-brand-400">{{ tanggal(r.date) }}</td>
              <td class="td text-right font-semibold text-brand-700">{{ rupiah(r.amount) }}</td>
            </tr>
            <tr v-if="!rows.length"><td colspan="6" class="td py-10 text-center text-brand-300">Belum ada transaksi.</td></tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>
