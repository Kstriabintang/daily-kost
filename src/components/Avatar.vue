<script setup>
import { computed } from 'vue'
import { initials } from '../utils/format'

const props = defineProps({
  name: { type: String, default: '' },
  hue: { type: Number, default: 158 },
  size: { type: Number, default: 40 },
})
const style = computed(() => ({
  width: props.size + 'px',
  height: props.size + 'px',
  background: `linear-gradient(135deg, hsl(${props.hue} 45% 42%), hsl(${props.hue} 55% 28%))`,
  fontSize: props.size * 0.36 + 'px',
}))
</script>

<template>
  <span class="flex items-center justify-center rounded-full font-semibold text-white ring-2 ring-white shadow-sm" :style="style">
    {{ initials(name) }}
  </span>
</template>
