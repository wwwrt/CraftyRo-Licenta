<template>
  <div id="app" class="flex flex-col min-h-screen">
    <header>
      <Navbar :selectedTab="selectedTab" @updateSelectedTab="updateSelectedTab" />
    </header>
    <div class="fixed inset-0 -z-10 min-h-screen w-full bg-gradient-to-br from-[#faedcd] via-[#fff] to-[#d4a373]/30">
      <div class="absolute top-0 left-0 w-32 h-32 bg-[#d4a373]/30 rounded-full blur-2xl"></div>
      <div class="absolute bottom-0 right-0 w-40 h-40 bg-[#7f5539]/20 rounded-full blur-2xl"></div>
    </div>
    <main class="flex-1 pt-14 sm:pt-24 mx-auto w-full">
      <router-view v-slot="{ Component }">
        <Transition name="page" mode="out-in">
          <component :is="Component" />
        </Transition>
      </router-view>
    </main>
    <!-- Footer apare doar daca nu e login, signup sau messages -->
    <Footer v-if="!['login', 'signup', 'messages'].includes(route.name)" />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Navbar from './components/NavBar.vue'
import Footer from './components/CraftyFooter.vue'


const selectedTab = ref('home')

function updateSelectedTab(tab) {
  selectedTab.value = tab
}

const route = useRoute()
const router = useRouter()

// Ascunde Navbar-ul pe pagina de mesaje (numele rutei trebuie să fie 'messages')

const swipeTabs = [
  'home',
  'shop',
  'learn',
  'leaderboard',
  'exhibition'
]

const currentTabIdx = computed(() => swipeTabs.indexOf(route.name))

function goToTab(idx) {
  router.push({ name: swipeTabs[idx] })
}

// --- KEYBOARD NAVIGATION LOGIC ---
function handleKeydown(e) {
  if (document.activeElement && ['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) return
  if (e.key === 'ArrowLeft' && currentTabIdx.value > 0) {
    goToTab(currentTabIdx.value - 1)
  }
  if (e.key === 'ArrowRight' && currentTabIdx.value < swipeTabs.length - 1) {
    goToTab(currentTabIdx.value + 1)
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeydown)
})
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeydown)
})
</script>

<style scoped>
#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.page-enter-active, .page-leave-active {
  transition:
    opacity 0.5s cubic-bezier(.4,0,.2,1),
    transform 0.5s cubic-bezier(.4,0,.2,1);
  will-change: opacity, transform;
}
.page-enter-from {
  opacity: 0;
  transform: translateY(40px) scale(0.98);
}
.page-enter-to {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.page-leave-from {
  opacity: 1;
  transform: translateY(0) scale(1);
}
.page-leave-to {
  opacity: 0;
  transform: translateY(-40px) scale(0.98);
}
</style>

<style>
html, body, #app, * {
  transition: background-color 0.8s cubic-bezier(.4,0,.2,1), color 0.8s cubic-bezier(.4,0,.2,1);
}
</style>
