<script setup>
import { reactive } from 'vue'
import { useRouter } from 'vue-router'
import { AREAS, DURATIONS, todayStr, nowStr } from '../../stores/kost'
import Icon from '../Icon.vue'

const props = defineProps({ initial: { type: Object, default: () => ({}) } })
const router = useRouter()

const defaultTime = () => {
  const h = Math.min(23, new Date().getHours() + 1)
  return `${String(h).padStart(2, '0')}:00`
}

const f = reactive({
  area: props.initial.area || '',
  date: props.initial.date || todayStr(),
  time: props.initial.time || defaultTime(),
  durasi: props.initial.durasi || '6j',
  guests: props.initial.guests || 1,
})

function submit() {
  router.push({ path: '/cari', query: { area: f.area || undefined, date: f.date, time: f.time, durasi: f.durasi, guests: f.guests } })
}
</script>

<template>
  <form @submit.prevent="submit"
    class="grid gap-2 rounded-2xl bg-surface p-2.5 shadow-[0_20px_50px_-20px_rgba(16,56,42,0.4)] ring-1 ring-line sm:grid-cols-2 lg:grid-cols-[1.3fr_1fr_0.9fr_1fr_0.7fr_auto] lg:gap-1.5">
    <label class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-tint/70">
      <Icon name="mapPin" :size="18" class="shrink-0 text-muted" />
      <span class="min-w-0 flex-1">
        <span class="block text-[11px] font-semibold text-soft">Lokasi</span>
        <select v-model="f.area" class="w-full bg-transparent text-sm font-medium text-ink focus:outline-none">
          <option value="">Semua area</option>
          <option v-for="a in AREAS" :key="a" :value="a">{{ a.replace('Pontianak ', '') }}</option>
        </select>
      </span>
    </label>
    <label class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-tint/70">
      <Icon name="calendar" :size="18" class="shrink-0 text-muted" />
      <span class="min-w-0 flex-1">
        <span class="block text-[11px] font-semibold text-soft">Tanggal masuk</span>
        <input v-model="f.date" type="date" :min="todayStr()" class="w-full bg-transparent text-sm font-medium text-ink focus:outline-none" />
      </span>
    </label>
    <label class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-tint/70">
      <Icon name="clock" :size="18" class="shrink-0 text-muted" />
      <span class="min-w-0 flex-1">
        <span class="block text-[11px] font-semibold text-soft">Jam masuk</span>
        <input v-model="f.time" type="time" class="w-full bg-transparent text-sm font-medium text-ink focus:outline-none" />
      </span>
    </label>
    <label class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-tint/70">
      <Icon name="sparkles" :size="18" class="shrink-0 text-muted" />
      <span class="min-w-0 flex-1">
        <span class="block text-[11px] font-semibold text-soft">Durasi</span>
        <select v-model="f.durasi" class="w-full bg-transparent text-sm font-medium text-ink focus:outline-none">
          <option v-for="d in DURATIONS" :key="d.key" :value="d.key">{{ d.label }}</option>
        </select>
      </span>
    </label>
    <label class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 transition hover:bg-tint/70">
      <Icon name="users" :size="18" class="shrink-0 text-muted" />
      <span class="min-w-0 flex-1">
        <span class="block text-[11px] font-semibold text-soft">Tamu</span>
        <select v-model.number="f.guests" class="w-full bg-transparent text-sm font-medium text-ink focus:outline-none">
          <option v-for="n in 4" :key="n" :value="n">{{ n }}</option>
        </select>
      </span>
    </label>
    <button type="submit" class="btn-primary h-full min-h-[52px] px-6 text-base sm:col-span-2 lg:col-span-1">
      <Icon name="search" :size="18" /> <span class="lg:hidden xl:inline">Cari</span>
    </button>
  </form>
</template>
