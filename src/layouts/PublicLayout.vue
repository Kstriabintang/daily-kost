<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import PublicNavbar from '../components/public/PublicNavbar.vue'
import PublicFooter from '../components/public/PublicFooter.vue'

const route = useRoute()
const solidNav = computed(() => route.name !== 'home')
</script>

<template>
  <div class="aurora min-h-screen">
    <div class="living-bg" aria-hidden="true"><span class="blob b1" /><span class="blob b2" /><span class="blob b3" /></div>
    <div class="relative z-10 flex min-h-screen flex-col">
      <PublicNavbar :solid="solidNav" />
      <main class="flex-1">
        <RouterView v-slot="{ Component }">
          <Transition name="page" mode="out-in">
            <component :is="Component" :key="route.fullPath" />
          </Transition>
        </RouterView>
      </main>
      <PublicFooter />
    </div>
  </div>
</template>
