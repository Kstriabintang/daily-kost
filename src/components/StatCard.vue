<script setup>
import Icon from './Icon.vue'

defineProps({
  label: String,
  value: [String, Number],
  sub: String,
  icon: String,
  trend: Number, // percentage, optional
  tone: { type: String, default: 'brand' },
})

const tones = {
  brand: 'bg-brand-50 text-brand-600',
  gold: 'bg-gold-300/30 text-gold-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  rose: 'bg-rose-50 text-rose-500',
  slate: 'bg-slate-100 text-slate-500',
}
</script>

<template>
  <div class="card group relative overflow-hidden p-5">
    <div class="absolute -top-8 -right-8 h-24 w-24 rounded-full bg-brand-50/60 transition group-hover:scale-125" />
    <div class="relative flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-brand-400">{{ label }}</p>
        <p class="mt-2 font-display text-[28px] leading-none font-bold text-brand-800">{{ value }}</p>
      </div>
      <span class="flex h-11 w-11 items-center justify-center rounded-xl" :class="tones[tone]">
        <Icon :name="icon" :size="21" />
      </span>
    </div>
    <div class="relative mt-3 flex items-center gap-2">
      <span v-if="trend !== undefined && trend !== null"
        class="chip"
        :class="trend >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-rose-50 text-rose-500'">
        <Icon :name="trend >= 0 ? 'trend' : 'trendDown'" :size="13" />
        {{ Math.abs(trend) }}%
      </span>
      <span class="text-xs text-brand-300">{{ sub }}</span>
    </div>
  </div>
</template>
