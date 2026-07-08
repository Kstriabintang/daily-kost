<script setup>
import { computed, ref } from 'vue'

const props = defineProps({
  data: { type: Array, default: () => [] }, // [{ date, value }]
  height: { type: Number, default: 180 },
  color: { type: String, default: '#00704a' },
  format: { type: Function, default: (v) => v },
})

const W = 640
const H = computed(() => props.height)
const pad = { t: 12, r: 8, b: 22, l: 8 }
const hover = ref(null)

const max = computed(() => Math.max(1, ...props.data.map((d) => d.value)))
const pts = computed(() => {
  const n = props.data.length
  if (!n) return []
  const iw = W - pad.l - pad.r
  const ih = H.value - pad.t - pad.b
  return props.data.map((d, i) => ({
    x: pad.l + (n === 1 ? iw / 2 : (i / (n - 1)) * iw),
    y: pad.t + ih - (d.value / max.value) * ih,
    ...d,
  }))
})

function smoothPath(points) {
  if (!points.length) return ''
  if (points.length === 1) return `M ${points[0].x} ${points[0].y}`
  let d = `M ${points[0].x} ${points[0].y}`
  for (let i = 0; i < points.length - 1; i++) {
    const p0 = points[i]
    const p1 = points[i + 1]
    const mx = (p0.x + p1.x) / 2
    d += ` C ${mx} ${p0.y}, ${mx} ${p1.y}, ${p1.x} ${p1.y}`
  }
  return d
}

const linePath = computed(() => smoothPath(pts.value))
const areaPath = computed(() => {
  if (!pts.value.length) return ''
  const base = H.value - pad.b
  return `${linePath.value} L ${pts.value[pts.value.length - 1].x} ${base} L ${pts.value[0].x} ${base} Z`
})

const gid = 'ag' + Math.random().toString(36).slice(2, 7)

function onMove(e) {
  const rect = e.currentTarget.getBoundingClientRect()
  const x = ((e.clientX - rect.left) / rect.width) * W
  let nearest = null
  let best = Infinity
  for (const p of pts.value) {
    const dist = Math.abs(p.x - x)
    if (dist < best) { best = dist; nearest = p }
  }
  hover.value = nearest
}
</script>

<template>
  <div class="relative w-full">
    <svg :viewBox="`0 0 ${W} ${H}`" class="w-full" :style="{ height: H + 'px' }" preserveAspectRatio="none"
      @mousemove="onMove" @mouseleave="hover = null">
      <defs>
        <linearGradient :id="gid" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" :stop-color="color" stop-opacity="0.28" />
          <stop offset="100%" :stop-color="color" stop-opacity="0" />
        </linearGradient>
      </defs>
      <path :d="areaPath" :fill="`url(#${gid})`" />
      <path :d="linePath" fill="none" :stroke="color" stroke-width="2.5" vector-effect="non-scaling-stroke" />
      <template v-if="hover">
        <line :x1="hover.x" :y1="pad.t" :x2="hover.x" :y2="H - pad.b" stroke="#1e3932" stroke-opacity="0.14" stroke-width="1" vector-effect="non-scaling-stroke" />
        <circle :cx="hover.x" :cy="hover.y" r="4.5" :fill="color" stroke="white" stroke-width="2" />
      </template>
    </svg>
    <div v-if="hover"
      class="pointer-events-none absolute -translate-x-1/2 -translate-y-full rounded-lg bg-brand-800 px-2.5 py-1.5 text-center text-xs text-white shadow-lg"
      :style="{ left: (hover.x / W) * 100 + '%', top: (hover.y / H) * 100 + '%' }">
      <div class="font-semibold">{{ format(hover.value) }}</div>
      <div class="text-[10px] text-brand-200">{{ hover.date }}</div>
    </div>
  </div>
</template>
