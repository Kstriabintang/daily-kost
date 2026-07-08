<script setup>
import { computed, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { useKostStore, AREAS, daysBetween } from '../../stores/kost'
import { rupiah, rupiahShort, tanggalPendek } from '../../utils/format'
import SearchBar from '../../components/public/SearchBar.vue'
import RoomCard from '../../components/public/RoomCard.vue'
import Icon from '../../components/Icon.vue'

const store = useKostStore()
const route = useRoute()

const filters = reactive({
  area: route.query.area || '',
  type: '',
  maxPrice: store.priceRange.max,
  sort: 'rekomendasi',
})
const showFilter = ref(false)

watch(() => route.query.area, (a) => { filters.area = a || '' })

const checkIn = computed(() => route.query.checkIn)
const checkOut = computed(() => route.query.checkOut)
const nights = computed(() => (checkIn.value && checkOut.value ? daysBetween(checkIn.value, checkOut.value) : 1))

const results = computed(() => {
  let list = store.searchRooms({
    area: filters.area,
    type: filters.type,
    maxPrice: filters.maxPrice,
    checkIn: checkIn.value,
    checkOut: checkOut.value,
  })
  if (filters.sort === 'termurah') list = [...list].sort((a, b) => a.dailyRate - b.dailyRate)
  else if (filters.sort === 'termahal') list = [...list].sort((a, b) => b.dailyRate - a.dailyRate)
  else if (filters.sort === 'rating') list = [...list].sort((a, b) => b.rating - a.rating)
  else list = [...list].sort((a, b) => b.rating - a.rating || a.dailyRate - b.dailyRate)
  return list
})

const types = ['Standard', 'Superior', 'Deluxe', 'Suite']
function resetFilters() {
  filters.area = ''
  filters.type = ''
  filters.maxPrice = store.priceRange.max
}
const passQuery = computed(() => ({ checkIn: checkIn.value, checkOut: checkOut.value, guests: route.query.guests }))
</script>

<template>
  <div class="bg-cream-50 pt-20 pb-16">
    <!-- Search summary bar -->
    <div class="border-b border-brand-700/5 bg-white">
      <div class="mx-auto max-w-6xl px-5 py-4">
        <SearchBar :initial="{ area: filters.area, checkIn, checkOut, guests: Number(route.query.guests) || 1 }" />
      </div>
    </div>

    <div class="mx-auto max-w-6xl px-5 pt-6">
      <div class="mb-5 flex items-center justify-between">
        <div>
          <h1 class="font-display text-2xl font-bold text-brand-800">
            {{ results.length }} kamar tersedia
            <span v-if="filters.area" class="text-brand-500">di {{ filters.area.replace('Pontianak ', '') }}</span>
          </h1>
          <p v-if="checkIn && checkOut" class="text-sm text-brand-400">{{ tanggalPendek(checkIn) }} – {{ tanggalPendek(checkOut) }} · {{ nights }} malam</p>
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
        <!-- Filters -->
        <aside class="space-y-5" :class="showFilter ? 'block' : 'hidden lg:block'">
          <div class="card p-5">
            <div class="mb-3 flex items-center justify-between">
              <h3 class="font-semibold text-brand-800">Filter</h3>
              <button class="text-xs font-medium text-brand-500 hover:text-brand-700" @click="resetFilters">Reset</button>
            </div>

            <div class="mb-5">
              <p class="mb-2 text-sm font-medium text-brand-600">Area</p>
              <div class="space-y-1.5">
                <label class="flex cursor-pointer items-center gap-2 text-sm text-brand-600">
                  <input type="radio" v-model="filters.area" value="" class="accent-brand-600" /> Semua area
                </label>
                <label v-for="a in AREAS" :key="a" class="flex cursor-pointer items-center gap-2 text-sm text-brand-600">
                  <input type="radio" v-model="filters.area" :value="a" class="accent-brand-600" /> {{ a.replace('Pontianak ', '') }}
                </label>
              </div>
            </div>

            <div class="mb-5">
              <p class="mb-2 text-sm font-medium text-brand-600">Tipe Kamar</p>
              <div class="flex flex-wrap gap-1.5">
                <button class="chip" :class="!filters.type ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-500'" @click="filters.type = ''">Semua</button>
                <button v-for="t in types" :key="t" class="chip" :class="filters.type === t ? 'bg-brand-600 text-white' : 'bg-brand-50 text-brand-500'" @click="filters.type = t">{{ t }}</button>
              </div>
            </div>

            <div>
              <p class="mb-1 text-sm font-medium text-brand-600">Harga maksimum</p>
              <p class="mb-2 font-display text-lg font-bold text-brand-700">{{ rupiah(filters.maxPrice) }}</p>
              <input type="range" v-model.number="filters.maxPrice" :min="store.priceRange.min" :max="store.priceRange.max" step="5000" class="w-full accent-brand-600" />
              <div class="mt-1 flex justify-between text-[11px] text-brand-400">
                <span>{{ rupiahShort(store.priceRange.min) }}</span><span>{{ rupiahShort(store.priceRange.max) }}</span>
              </div>
            </div>
          </div>
        </aside>

        <!-- Results -->
        <div>
          <div v-if="results.length" class="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
            <div v-for="r in results" :key="r.id" class="animate-fade">
              <RoomCard :room="r" :query="passQuery" />
            </div>
          </div>
          <div v-else class="card flex flex-col items-center justify-center px-6 py-20 text-center">
            <span class="flex h-16 w-16 items-center justify-center rounded-full bg-brand-50 text-brand-400"><Icon name="search" :size="30" /></span>
            <h3 class="mt-4 font-display text-lg font-bold text-brand-800">Tidak ada kamar cocok</h3>
            <p class="mt-1 text-sm text-brand-400">Coba ubah filter atau tanggal pencarian.</p>
            <button class="btn-primary mt-5" @click="resetFilters">Reset Filter</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
