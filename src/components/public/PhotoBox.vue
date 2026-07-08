<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  seed: { type: String, default: 'kost' },
  hue: { type: Number, default: 158 },
  w: { type: Number, default: 800 },
  h: { type: Number, default: 600 },
  alt: { type: String, default: '' },
  rounded: { type: String, default: '' },
})
const loaded = ref(false)
const failed = ref(false)
const src = computed(() => `https://picsum.photos/seed/dk-${props.seed}/${props.w}/${props.h}`)
const gradient = computed(() => `linear-gradient(135deg, hsl(${props.hue} 42% 34%), hsl(${props.hue} 55% 22%))`)
</script>

<template>
  <div class="relative h-full w-full overflow-hidden" :class="rounded" :style="{ background: gradient }">
    <!-- pattern fallback -->
    <div class="absolute inset-0 opacity-20" style="background-image: radial-gradient(circle at 25% 30%, white 1px, transparent 1px); background-size: 22px 22px;" />
    <img
      v-if="!failed"
      :src="src"
      :alt="alt"
      loading="lazy"
      class="absolute inset-0 h-full w-full object-cover transition-opacity duration-700"
      :class="loaded ? 'opacity-100' : 'opacity-0'"
      @load="loaded = true"
      @error="failed = true" />
    <div class="pointer-events-none absolute inset-0 bg-gradient-to-t from-brand-950/50 via-transparent to-transparent" />
  </div>
</template>
