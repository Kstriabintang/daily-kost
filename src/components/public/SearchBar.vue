<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { AREAS, todayStr, addDays } from '../../stores/kost'
import Icon from '../Icon.vue'

const props = defineProps({ compact: Boolean, initial: { type: Object, default: () => ({}) } })
const router = useRouter()

const f = reactive({
  area: props.initial.area || '',
  checkIn: props.initial.checkIn || todayStr(),
  checkOut: props.initial.checkOut || addDays(todayStr(), 1),
  guests: props.initial.guests || 1,
})

function submit() {
  router.push({ path: '/cari', query: { area: f.area || undefined, checkIn: f.checkIn, checkOut: f.checkOut, guests: f.guests } })
}
</script>

<template>
  <form @submit.prevent="submit"
    class="grid gap-2 rounded-2xl bg-white p-2.5 shadow-[0_20px_50px_-20px_rgba(16,56,42,0.4)] ring-1 ring-brand-700/5 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_0.8fr_auto] lg:gap-1.5">
    <label class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-brand-50/70">
      <Icon name="mapPin" :size="18" class="shrink-0 text-brand-500" />
      <span class="min-w-0 flex-1">
        <span class="block text-[11px] font-semibold text-brand-400">Lokasi</span>
        <select v-model="f.area" class="w-full bg-transparent text-sm font-medium text-brand-800 focus:outline-none">
          <option value="">Semua area Pontianak</option>
          <option v-for="a in AREAS" :key="a" :value="a">{{ a }}</option>
        </select>
      </span>
    </label>
    <label class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-brand-50/70">
      <Icon name="calendar" :size="18" class="shrink-0 text-brand-500" />
      <span class="min-w-0 flex-1">
        <span class="block text-[11px] font-semibold text-brand-400">Check-in</span>
        <input v-model="f.checkIn" type="date" class="w-full bg-transparent text-sm font-medium text-brand-800 focus:outline-none" />
      </span>
    </label>
    <label class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-brand-50/70">
      <Icon name="calendar" :size="18" class="shrink-0 text-brand-500" />
      <span class="min-w-0 flex-1">
        <span class="block text-[11px] font-semibold text-brand-400">Check-out</span>
        <input v-model="f.checkOut" type="date" :min="f.checkIn" class="w-full bg-transparent text-sm font-medium text-brand-800 focus:outline-none" />
      </span>
    </label>
    <label class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-brand-50/70">
      <Icon name="users" :size="18" class="shrink-0 text-brand-500" />
      <span class="min-w-0 flex-1">
        <span class="block text-[11px] font-semibold text-brand-400">Tamu</span>
        <select v-model.number="f.guests" class="w-full bg-transparent text-sm font-medium text-brand-800 focus:outline-none">
          <option v-for="n in 4" :key="n" :value="n">{{ n }} orang</option>
        </select>
      </span>
    </label>
    <button type="submit" class="btn-primary h-full min-h-[52px] px-6 text-base">
      <Icon name="search" :size="18" /> <span class="lg:hidden xl:inline">Cari</span>
    </button>
  </form>
</template>
