<script setup>
import { computed } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] }, // [{ label, value }]
  height: { type: Number, default: 200 },
  color: { type: String, default: '#00704a' },
  format: { type: Function, default: (v) => v },
})

const max = computed(() => Math.max(1, ...props.data.map((d) => d.value)))
</script>

<template>
  <div class="flex items-end gap-3" :style="{ height: height + 'px' }">
    <div v-for="d in data" :key="d.label" class="group flex flex-1 flex-col items-center justify-end gap-2">
      <div class="relative w-full">
        <div
          class="pointer-events-none absolute -top-7 left-1/2 -translate-x-1/2 rounded-md bg-brand-800 px-2 py-0.5 text-[10px] font-semibold whitespace-nowrap text-white opacity-0 shadow transition group-hover:opacity-100">
          {{ format(d.value) }}
        </div>
        <div
          class="mx-auto w-full max-w-[42px] rounded-t-lg transition-all duration-500 group-hover:opacity-80"
          :style="{ height: Math.max(4, (d.value / max) * (height - 34)) + 'px', background: `linear-gradient(180deg, ${color}, ${color}cc)` }" />
      </div>
      <span class="truncate text-[11px] font-medium text-brand-500">{{ d.label }}</span>
    </div>
  </div>
</template>
