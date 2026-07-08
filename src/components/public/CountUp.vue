<script setup>
import { ref, onMounted, onUnmounted } from 'vue'

const props = defineProps({
  to: { type: Number, required: true },
  duration: { type: Number, default: 1400 },
  suffix: { type: String, default: '' },
  prefix: { type: String, default: '' },
})
const display = ref(0)
const el = ref(null)
let started = false
let raf = null

function run() {
  const start = performance.now()
  const step = (now) => {
    const p = Math.min(1, (now - start) / props.duration)
    const eased = 1 - Math.pow(1 - p, 3)
    display.value = Math.round(eased * props.to)
    if (p < 1) raf = requestAnimationFrame(step)
  }
  raf = requestAnimationFrame(step)
}

let io
onMounted(() => {
  io = new IntersectionObserver((entries) => {
    if (entries[0].isIntersecting && !started) {
      started = true
      run()
      io.disconnect()
    }
  }, { threshold: 0.4 })
  if (el.value) io.observe(el.value)
})
onUnmounted(() => { io?.disconnect(); cancelAnimationFrame(raf) })
</script>

<template>
  <span ref="el">{{ prefix }}{{ display.toLocaleString('id-ID') }}{{ suffix }}</span>
</template>
