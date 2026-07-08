<script setup>
import { computed } from 'vue'
import { RouterView, useRoute } from 'vue-router'
import PublicNavbar from '../components/public/PublicNavbar.vue'
import PublicFooter from '../components/public/PublicFooter.vue'

const route = useRoute()
const solidNav = computed(() => route.name !== 'home')
</script>

<template>
  <div class="flex min-h-screen flex-col bg-cream-50">
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
</template>
