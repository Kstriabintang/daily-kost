<script setup>
defineProps({ title: String, subtitle: String })
</script>

<template>
  <div class="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
    <div>
      <h1 class="font-display text-2xl font-bold text-brand-800 sm:text-3xl">{{ title }}</h1>
      <p v-if="subtitle" class="mt-1 text-sm text-brand-400">{{ subtitle }}</p>
    </div>
    <div class="flex items-center gap-2">
      <slot name="actions" />
    </div>
  </div>
</template>
