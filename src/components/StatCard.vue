<script setup>
defineProps({
  label: String,
  value: [String, Number],
  sub: String,
  icon: String,
  tone: { type: String, default: 'indigo' },
})

const tones = {
  indigo: 'bg-indigo-50 text-indigo-600',
  emerald: 'bg-emerald-50 text-emerald-600',
  amber: 'bg-amber-50 text-amber-600',
  rose: 'bg-rose-50 text-rose-600',
}
</script>

<template>
  <div class="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100">
    <div class="flex items-start justify-between">
      <div>
        <p class="text-sm font-medium text-slate-500">{{ label }}</p>
        <p class="mt-2 text-2xl font-bold text-slate-800">{{ value }}</p>
        <p v-if="sub" class="mt-1 text-xs text-slate-400">{{ sub }}</p>
      </div>
      <span class="flex h-10 w-10 items-center justify-center rounded-xl text-lg" :class="tones[tone]">
        {{ icon }}
      </span>
    </div>
  </div>
</template>
