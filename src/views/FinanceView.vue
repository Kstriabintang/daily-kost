<script setup>
import { computed, reactive, ref } from 'vue'
import { useKostStore } from '../stores/kost'
import { rupiah, rupiahShort, tanggal } from '../utils/format'
import PageHeader from '../components/PageHeader.vue'
import StatCard from '../components/StatCard.vue'
import ModalDialog from '../components/ModalDialog.vue'
import Icon from '../components/Icon.vue'
import AreaChart from '../components/charts/AreaChart.vue'
import DonutChart from '../components/charts/DonutChart.vue'

const store = useKostStore()
const open = ref(false)
const cats = ['Listrik & Air', 'Kebersihan', 'Perawatan', 'Gaji Staff', 'Internet', 'Perlengkapan']
const form = reactive({ propertyId: '', category: cats[0], amount: 500000, note: '' })

const margin = computed(() => (store.totalRevenue ? Math.round((store.netProfit / store.totalRevenue) * 100) : 0))
const revSeries = computed(() => store.revenueSeries(30).map((d) => ({ ...d, date: tanggal(d.date, { year: undefined }) })))

const expenseByCat = computed(() => {
  const map = {}
  for (const e of store.scopedExpenses) map[e.category] = (map[e.category] || 0) + e.amount
  return Object.entries(map).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value)
})
const recentExpenses = computed(() => [...store.scopedExpenses].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8))

function openAdd() {
  Object.assign(form, { propertyId: store.activePropertyId || store.properties[0]?.id, category: cats[0], amount: 500000, note: '' })
  open.value = true
}
function save() {
  if (!form.amount) return
  store.addExpense({ ...form, amount: Number(form.amount) })
  open.value = false
}
</script>

<template>
  <div>
    <PageHeader title="Keuangan" subtitle="Laba rugi & arus kas operasional">
      <template #actions><button class="btn-primary" @click="openAdd"><Icon name="plus" :size="16" /> Catat Pengeluaran</button></template>
    </PageHeader>

    <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
      <StatCard label="Total Pendapatan" :value="rupiahShort(store.totalRevenue)" sub="semua transaksi" icon="trend" tone="emerald" :trend="12" />
      <StatCard label="Total Pengeluaran" :value="rupiahShort(store.totalExpense)" sub="biaya operasional" icon="trendDown" tone="rose" />
      <StatCard label="Laba Bersih" :value="rupiahShort(store.netProfit)" sub="pendapatan − biaya" icon="money" tone="brand" :trend="margin" />
      <StatCard label="Margin" :value="`${margin}%`" sub="profitabilitas" icon="chart" tone="gold" />
    </div>

    <div class="mt-4 grid gap-4 lg:grid-cols-3">
      <div class="card p-5 lg:col-span-2">
        <h2 class="font-display text-lg font-bold text-brand-800">Arus Pendapatan (30 hari)</h2>
        <p class="mb-3 text-sm text-brand-400">Total {{ rupiah(revSeries.reduce((s, d) => s + d.value, 0)) }}</p>
        <AreaChart :data="revSeries" :format="rupiah" :height="200" />
      </div>
      <div class="card p-5">
        <h2 class="font-display text-lg font-bold text-brand-800">Pengeluaran per Kategori</h2>
        <p class="mb-3 text-sm text-brand-400">Total {{ rupiah(store.totalExpense) }}</p>
        <DonutChart :data="expenseByCat" :center-value="rupiahShort(store.totalExpense)" center-label="Biaya" :size="150" :thickness="20" />
      </div>
    </div>

    <div class="mt-4 card overflow-hidden">
      <div class="flex items-center justify-between px-5 py-4">
        <h2 class="font-display text-lg font-bold text-brand-800">Pengeluaran Terbaru</h2>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-brand-50/60"><tr><th class="th">Kategori</th><th class="th">Properti</th><th class="th">Tanggal</th><th class="th text-right">Jumlah</th><th class="th"></th></tr></thead>
          <tbody class="divide-y divide-brand-700/5">
            <tr v-for="e in recentExpenses" :key="e.id" class="hover:bg-brand-50/40">
              <td class="td font-medium">{{ e.category }}</td>
              <td class="td text-brand-400">{{ store.propertyById(e.propertyId)?.name }}</td>
              <td class="td text-brand-400">{{ tanggal(e.date) }}</td>
              <td class="td text-right font-semibold text-rose-500">− {{ rupiah(e.amount) }}</td>
              <td class="td text-right"><button class="text-brand-300 hover:text-rose-500" @click="store.removeExpense(e.id)"><Icon name="trash" :size="15" /></button></td>
            </tr>
            <tr v-if="!recentExpenses.length"><td colspan="5" class="td py-10 text-center text-brand-300">Belum ada pengeluaran.</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <ModalDialog :open="open" title="Catat Pengeluaran" @close="open = false">
      <form class="space-y-4" @submit.prevent="save">
        <div><label class="label">Properti</label><select v-model="form.propertyId" class="input"><option v-for="p in store.properties" :key="p.id" :value="p.id">{{ p.name }}</option></select></div>
        <div class="grid grid-cols-2 gap-3">
          <div><label class="label">Kategori</label><select v-model="form.category" class="input"><option v-for="c in cats" :key="c">{{ c }}</option></select></div>
          <div><label class="label">Jumlah</label><input v-model.number="form.amount" type="number" step="50000" class="input" /></div>
        </div>
        <div><label class="label">Catatan</label><input v-model="form.note" class="input" placeholder="opsional" /></div>
        <div class="flex justify-end gap-2"><button type="button" class="btn-ghost" @click="open = false">Batal</button><button type="submit" class="btn-primary">Simpan</button></div>
      </form>
    </ModalDialog>
  </div>
</template>
