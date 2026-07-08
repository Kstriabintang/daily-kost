<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] }, // [{ label, value }]
  size: { type: Number, default: 168 },
  thickness: { type: Number, default: 22 },
  centerLabel: { type: String, default: '' },
  centerValue: { type: [String, Number], default: '' },
})

const palette = ['#00704a', '#1f7a57', '#3f9573', '#6fb597', '#c8a15a', '#a6d3bf']

const total = computed(() => props.data.reduce((s, d) => s + d.value, 0) || 1)
const r = computed(() => (props.size - props.thickness) / 2)
const circ = computed(() => 2 * Math.PI * r.value)

const segments = computed(() => {
  let offset = 0
  return props.data.map((d, i) => {
    const frac = d.value / total.value
    const seg = {
      ...d,
      color: palette[i % palette.length],
      dash: frac * circ.value,
      gap: circ.value - frac * circ.value,
      offset: -offset * circ.value,
      pct: Math.round(frac * 100),
    }
    offset += frac
    return seg
  })
})
</script>

<template>
  <div class="flex items-center gap-5">
    <div class="relative shrink-0" :style="{ width: size + 'px', height: size + 'px' }">
      <svg :width="size" :height="size" :viewBox="`0 0 ${size} ${size}`" class="-rotate-90">
        <circle :cx="size / 2" :cy="size / 2" :r="r" fill="none" stroke="#eef2f0" :stroke-width="thickness" />
        <circle v-for="s in segments" :key="s.label"
          :cx="size / 2" :cy="size / 2" :r="r" fill="none"
          :stroke="s.color" :stroke-width="thickness"
          :stroke-dasharray="`${s.dash} ${s.gap}`" :stroke-dashoffset="s.offset"
          stroke-linecap="butt" class="transition-all duration-700" />
      </svg>
      <div class="absolute inset-0 flex flex-col items-center justify-center">
        <span class="font-display text-2xl font-bold text-brand-800">{{ centerValue }}</span>
        <span class="text-[11px] text-brand-400">{{ centerLabel }}</span>
      </div>
    </div>
    <ul class="flex-1 space-y-2">
      <li v-for="s in segments" :key="s.label" class="flex items-center gap-2 text-sm">
        <span class="h-2.5 w-2.5 rounded-full" :style="{ background: s.color }" />
        <span class="flex-1 text-brand-600">{{ s.label }}</span>
        <span class="font-semibold text-brand-800">{{ s.value }}</span>
        <span class="w-9 text-right text-xs text-brand-400">{{ s.pct }}%</span>
      </li>
    </ul>
  </div>
</template>
