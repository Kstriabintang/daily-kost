<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useKostStore, AREAS, DURATIONS, durationByKey } from '../../stores/kost'
import { rupiah, rupiahShort, tanggalPendek } from '../../utils/format'
import SearchBar from '../../components/public/SearchBar.vue'
import RoomCard from '../../components/public/RoomCard.vue'
import Icon from '../../components/Icon.vue'

const store = useKostStore()
const route = useRoute()

const filters = reactive({ area: route.query.area || '', type: '', maxPrice: store.priceRange.max, sort: 'rekomendasi' })
const showFilter = ref(false)
watch(() => route.query.area, (a) => { filters.area = a || '' })

const date = computed(() => route.query.date)
const time = computed(() => route.query.time)
const durasi = computed(() => route.query.durasi || '6j')
const checkInAt = computed(() => (date.value && time.value ? `${date.value}T${time.value}` : null))
const durLabel = computed(() => durationByKey(durasi.value).label)

const results = computed(() => {
  let list = store.searchRooms({ area: filters.area, type: filters.type, maxPrice: filters.maxPrice, checkInAt: checkInAt.value, durationKey: durasi.value })
  const rate = (r) => (r.rates?.[durasi.value] ?? r.dailyRate)
  if (filters.sort === 'termurah') list = [...list].sort((a, b) => rate(a) - rate(b))
  else if (filters.sort === 'termahal') list = [...list].sort((a, b) => rate(b) - rate(a))
  else if (filters.sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
  else list = [...list].sort((a, b) => b.rating - a.rating || rate(a) - rate(b))
  return list
})

const types = ['Standard', 'Deluxe', 'Executive']
function resetFilters() { filters.area = ''; filters.type = ''; filters.maxPrice = store.priceRange.max }
const passQuery = computed(() => ({ date: date.value, time: time.value, durasi: durasi.value, guests: route.query.guests }))
</script>

<template>
  <div class="pt-20 pb-16">
    <div class="border-b border-brand-700/5 bg-white">
      <div class="mx-auto max-w-6xl px-5 py-4">
        <SearchBar :initial="{ area: filters.area, date, time, durasi, guests: Number(route.query.guests) || 1 }" />
      </div>
    </div>

    <div class="mx-auto max-w-6xl px-5 pt-6">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h1 class="font-display text-2xl font-bold text-brand-800">
            {{ results.length }} kamar tersedia
            <span v-if="filters.area" class="text-brand-500">di {{ filters.area.replace('Pontianak ', '') }}</span>
          </h1>
          <p class="flex flex-wrap items-center gap-2 text-sm text-brand-400">
            <span class="chip bg-brand-50 text-brand-600"><Icon name="sparkles" :size="12" /> {{ durLabel }}</span>
            <span v-if="checkInAt">masuk {{ tanggalPendek(date) }} · {{ time }}</span>
          </p>
        </div>
        <div class="flex items-center gap-2">
          <button class="btn-outline lg:hidden" @click="showFilter = !showFilter"><Icon name="filter" :size="16" /> Filter</button>
          <select v-model="filters.sort" class="hidden rounded-xl border border-brand-200/70 bg-white px-3 py-2.5 text-sm font-medium text-brand-700 focus:outline-none sm:block">
            <option value="rekomendasi">Rekomendasi</option>
            <option value="termurah">Harga Termurah</option>
            <option value="termahal">Harga Tertinggi</option>
            <option value="rating">Rating Tertinggi</option>
          </select>
        </div>
      </div>

      <div class="grid gap-6 lg:grid-cols-[260px_1fr]">
        <aside class="space-y-5" :class="showFilter ? 'block' : 'hidden lg:block'">
          <div class="card p-5">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="font-semibold text-brand-800">Filter</h3>
              <button class="text-xs font-medium text-brand-500 hover:text-brand-700" @click="resetFilters">Reset</button>
            </div>
            <div class="mb-5">
              <p class="mb-2 text-sm font-medium text-brand-600">Area</p>
              <div class="space-y-1.5">
                <label class="flex cursor-pointer items-center gap-2 text-sm text-brand-600"><input type="radio" v-model="filters.area" value="" class="accent-brand-600" /> Semua area</label>
                <label v-for="a in AREAS" :key="a" class="flex cursor-pointer items-center gap-2 text-sm text-brand-600"><input type="radio" v-model="filters.area" :value="a" class="accent-brand-600" /> {{ a.replace('Pontianak ', '') }}</label>
              </div>
            </div>
            <div class="mb-5">
              <p class="mb-2 text-sm font-medium text-brand-600">Kelas Kamar</p>
              <div class="flex flex-wrap gap-1.5">
                <button class="chip" :class="!filters.type ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-500'" @click="filters.type = ''">Semua</button>
                <button v-for="t in types" :key="t" class="chip" :class="filters.type === t ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-500'" @click="filters.type = t">{{ t }}</button>
              </div>
            </div>
            <div>
              <p class="mb-1 text-sm font-medium text-brand-600">Harga /hari maks</p>
              <p class="mb-2 font-display text-lg font-bold text-brand-700">{{ rupiah(filters.maxPrice) }}</p>
              <input type="range" v-model.number="filters.maxPrice" :min="store.priceRange.min" :max="store.priceRange.max" step="5000" class="w-full accent-brand-600" />
              <div class="mt-1 flex justify-between text-[11px] text-brand-400"><span>{{ rupiahShort(store.priceRange.min) }}</span><span>{{ rupiahShort(store.priceRange.max) }}</span></div>
            </div>
          </div>
        </aside>

        <div>
          <div v-if="results.length" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <div v-for="r in results" :key="r.id" class="animate-fade"><RoomCard :room="r" :query="passQuery" /></div>
          </div>
          <div v-else class="card flex flex-col items-center justify-center px-6 py-20 text-center">
            <span class="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-400"><Icon name="search" :size="30" /></span>
            <h3 class="mt-4 font-display text-lg font-bold text-brand-800">Tidak ada kamar cocok</h3>
            <p class="mt-1 text-sm text-brand-400">Coba ubah filter, tanggal, atau durasi.</p>
            <button class="btn-primary mt-5" @click="resetFilters">Reset Filter</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
