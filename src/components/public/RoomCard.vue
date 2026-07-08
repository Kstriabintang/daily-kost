<script setup>
import { RouterLink } from 'vue-router'
import { rupiah } from '../../utils/format'
import PhotoBox from './PhotoBox.vue'
import Icon from '../Icon.vue'

defineProps({ room: { type: Object, required: true }, query: { type: Object, default: () => ({}) } })
</script>

<template>
  <RouterLink :to="{ path: `/kamar/${room.id}`, query }"
    class="group block overflow-hidden rounded-2xl bg-white shadow-[0_4px_20px_-8px_rgba(16,56,42,0.15)] ring-1 ring-brand-700/5 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-[0_20px_40px_-12px_rgba(16,56,42,0.28)]">
    <div class="relative h-48 overflow-hidden">
      <div class="h-full w-full transition-transform duration-700 group-hover:scale-110">
        <PhotoBox :seed="room.id" :hue="room.property?.hue || 158" :alt="`Kamar ${room.number} ${room.property?.name}`" :w="600" :h="400" />
      </div>
      <span class="absolute top-3 left-3 chip bg-white/95 text-brand-700 shadow-sm backdrop-blur"><Icon name="star" :size="12" class="text-gold-500" /> {{ room.rating }}</span>
      <span class="absolute top-3 right-3 chip bg-brand-600/95 text-white shadow-sm backdrop-blur">{{ room.type }}</span>
      <div class="absolute bottom-3 left-3 flex items-center gap-1 text-xs font-medium text-white drop-shadow">
        <Icon name="mapPin" :size="13" /> {{ room.area?.replace('Pontianak ', '') }}
      </div>
    </div>
    <div class="p-4">
      <h3 class="truncate font-display text-lg font-bold text-brand-800">{{ room.property?.name }}</h3>
      <p class="mt-0.5 flex items-center gap-1 text-xs text-brand-400">
        <Icon name="door" :size="12" /> Kamar {{ room.number }} · {{ room.reviews }} ulasan
      </p>
      <div class="mt-3 flex flex-wrap gap-1.5">
        <span v-for="fac in room.facilities.slice(0, 3)" :key="fac" class="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] text-brand-500">{{ fac }}</span>
        <span v-if="room.facilities.length > 3" class="rounded-md bg-brand-50 px-2 py-0.5 text-[11px] text-brand-400">+{{ room.facilities.length - 3 }}</span>
      </div>
      <div class="mt-4 flex items-end justify-between border-t border-brand-700/5 pt-3">
        <div>
          <span class="text-[11px] text-brand-400">mulai</span>
          <p><span class="font-display text-xl font-bold text-brand-700">{{ rupiah(room.startingRate ?? room.rates?.['3j'] ?? room.dailyRate) }}</span><span class="text-xs text-brand-400">/3 jam</span></p>
        </div>
        <span class="flex items-center gap-1 text-sm font-semibold text-brand-600 transition group-hover:gap-2">Pesan <Icon name="arrowRight" :size="15" /></span>
      </div>
    </div>
  </RouterLink>
</template>
