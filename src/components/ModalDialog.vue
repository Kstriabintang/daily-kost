<script setup>
defineProps({ title: String, open: Boolean })
defineEmits(['close'])
</script>

<template>
  <Transition
    enter-active-class="transition duration-150 ease-out"
    enter-from-class="opacity-0"
    leave-active-class="transition duration-100 ease-in"
    leave-to-class="opacity-0"
  >
    <div v-if="open" class="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/40 p-0 sm:items-center sm:p-4" @click.self="$emit('close')">
      <div class="w-full max-w-lg rounded-t-3xl bg-white p-6 shadow-xl sm:rounded-2xl">
        <div class="mb-4 flex items-center justify-between">
          <h3 class="text-lg font-semibold text-slate-800">{{ title }}</h3>
          <button class="text-slate-400 hover:text-slate-600" @click="$emit('close')">✕</button>
        </div>
        <slot />
      </div>
    </div>
  </Transition>
</template>
