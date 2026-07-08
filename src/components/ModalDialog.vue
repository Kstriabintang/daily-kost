<script setup>
import Icon from './Icon.vue'
defineProps({ title: String, subtitle: String, open: Boolean, wide: Boolean })
defineEmits(['close'])
</script>

<template>
  <Teleport to="body">
    <Transition
      enter-active-class="transition duration-200 ease-out"
      enter-from-class="opacity-0"
      leave-active-class="transition duration-150 ease-in"
      leave-to-class="opacity-0">
      <div v-if="open" class="fixed inset-0 z-[60] flex items-end justify-center bg-brand-950/50 backdrop-blur-sm sm:items-center sm:p-4"
        @click.self="$emit('close')">
        <Transition
          enter-active-class="transition duration-250 ease-out"
          enter-from-class="opacity-0 translate-y-4 sm:scale-95"
          leave-active-class="transition duration-150 ease-in"
          leave-to-class="opacity-0 sm:scale-95">
          <div v-if="open" class="card-lg max-h-[92vh] w-full overflow-y-auto rounded-b-none sm:rounded-3xl"
            :class="wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'">
            <div class="sticky top-0 z-10 flex items-start justify-between gap-4 border-b border-brand-700/5 bg-white/90 px-6 py-5 backdrop-blur">
              <div>
                <h3 class="font-display text-xl font-bold text-brand-800">{{ title }}</h3>
                <p v-if="subtitle" class="mt-0.5 text-sm text-brand-400">{{ subtitle }}</p>
              </div>
              <button class="rounded-lg p-1.5 text-brand-300 hover:bg-brand-50 hover:text-brand-600" @click="$emit('close')">
                <Icon name="x" :size="20" />
              </button>
            </div>
            <div class="px-6 py-5">
              <slot />
            </div>
          </div>
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>
