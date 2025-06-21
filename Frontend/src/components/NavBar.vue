<template>
  <nav
    :class="[
      'fixed top-0 left-0 w-full z-50 pr-4 pl-0 flex justify-between items-center h-24 bg-transparent transition-all duration-500',
      scrolled
        ? (ui.darkMode
            ? 'backdrop-blur-lg shadow-[0_8px_32px_0_rgba(0,0,0,0.55)]'
            : 'backdrop-blur-lg shadow-[0_8px_32px_0_rgba(212,163,115,0.25)]')
        : ''
    ]"
  >
    <!-- Stânga: Logo -->
    <div class="flex-shrink-0 h-full flex items-center overflow-visible ml-6">
      <img
        :src="ui.darkMode ? '/images/LogoDM2.png' : '/images/LogoWM2.png'"
        class="h-44 w-auto object-contain m-0 p-0"
        alt="Crafty Logo"
      />
    </div>

    <!-- Mijloc: Meniu desktop -->
    <div class="flex-1 flex justify-center">
      <ul class="hidden lg:flex flex-wrap items-center justify-center space-x-4">
        <li v-for="tab in tabs" :key="tab.key">
          <RouterLink :class="[
            'text-lg',
            'font-bold',
            'rounded',
            'p-2',
            'transition-all duration-500',
            ui.darkMode
              ? 'text-white'
              : 'text-[#443429]',
            'navbar-hover',
            route.name === tab.key ? 'active-tab' : ''
          ]" :to="{ name: tab.key }" @click="updateTab(tab.key)">
            {{ tab.label }}
          </RouterLink>
        </li>
      </ul>
    </div>

    <!-- Dreapta: Dropdown, Darkmode, Cart, Profil -->
    <div class="flex items-center space-x-2">
      <!-- Meniu dropdown (hamburger) - vizibil doar pe mobil -->
      <button
        class="lg:hidden p-2 w-10 h-10 rounded-full bg-[#443429] text-white focus:outline-none shadow-lg hover:bg-[#feb76a] transition flex items-center justify-center"
        @click="showMobileMenu = !showMobileMenu"
        aria-label="Deschide meniul"
      >
        <!-- Heroicons Menu -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
        </svg>
      </button>
      <!-- Buton dark mode -->
      <button
        @click="ui.toggleDarkMode"
        aria-label="Comută mod întunecat/luminos"
        class="p-2 w-10 h-10 rounded-full bg-[#443429] text-white focus:outline-none shadow-lg hover:bg-[#feb76a] transition flex items-center justify-center"
        :title="ui.darkMode ? 'Mod luminos' : 'Mod întunecat'"
      >
        <svg v-if="!ui.darkMode" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 3v2.25m6.364.386-1.591 1.591M21 12h-2.25m-.386 6.364-1.591-1.591M12 18.75V21m-4.773-4.227-1.591 1.591M5.25 12H3m4.227-4.773L5.636 5.636M15.75 12a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0Z" />
        </svg>
        <svg v-else xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M21.752 15.002A9.72 9.72 0 0 1 18 15.75c-5.385 0-9.75-4.365-9.75-9.75 0-1.33.266-2.597.748-3.752A9.753 9.753 0 0 0 3 11.25C3 16.635 7.365 21 12.75 21a9.753 9.753 0 0 0 9.002-5.998Z" />
        </svg>
      </button>
      <template v-if="userLoading">
        <div class="flex gap-2">
          <div class="w-10 h-10 rounded-full bg-[#faedcd] animate-pulse"></div>
          <div class="w-10 h-10 rounded-full bg-[#faedcd] animate-pulse"></div>
          <div class="w-10 h-10 rounded-full bg-[#faedcd] animate-pulse"></div>
        </div>
      </template>
      <template v-else>
        <template v-if="currentUser">
          <!-- Cart -->
          <RouterLink
            class="relative p-2 w-10 h-10 rounded-full bg-[#443429] text-white focus:outline-none shadow-lg hover:bg-[#feb76a] transition flex items-center justify-center"
            :to="{ name: 'cart' }">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 0 0-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 0 0-16.536-1.84M7.5 14.25 5.106 5.272M6 20.25a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Zm12.75 0a.75.75 0 1 1-1.5 0 .75.75 0 0 1 1.5 0Z" />
            </svg>
            <span
              v-if="activeCartCount > 0"
              class="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 bg-[#f55f09] text-white text-xs rounded-full px-2 py-0.5 font-bold border-2 border-white"
              style="min-width: 1.5em; text-align: center;"
            >
              {{ activeCartCount }}
            </span>
          </RouterLink>
          <!-- Mesaje -->
          <RouterLink
            class="relative p-2 w-10 h-10 rounded-full bg-[#443429] text-white focus:outline-none shadow-lg hover:bg-[#feb76a] transition flex items-center justify-center"
            :to="{ name: 'messages' }"
            title="Mesaje"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M2.25 12l1.5 1.5m0 0l1.5 1.5m-1.5-1.5V6.75A2.25 2.25 0 016.75 4.5h10.5A2.25 2.25 0 0119.5 6.75v10.5A2.25 2.25 0 0117.25 19.5H6.75A2.25 2.25 0 014.5 17.25V13.5m0 0l-1.5-1.5z" />
            </svg>
            <span
              v-if="unreadCount > 0"
              class="absolute bottom-0 right-0 translate-x-1/3 translate-y-1/3 bg-[#f55f09] text-white text-xs rounded-full px-2 py-0.5 font-bold border-2 border-white"
              style="min-width: 1.5em; text-align: center;"
            >
              {{ unreadCount }}
            </span>
          </RouterLink>
          <!-- Profil -->
          <div class="relative">
            <RouterLink
              :to="{ name: 'profile' }"
              class="profile-toggle focus:outline-none"
              aria-label="Profil utilizator"
            >
              <img
                :src="userPhotoURL"
                alt="Profile"
                class="w-10 h-10 rounded-full cursor-pointer object-cover"
                @error="userPhotoURL = defaultAvatar"
              />
            </RouterLink>
            <div v-show="showDropdown" id="profileDropdown"
              class="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-2 z-20">
              <RouterLink to="/favorites" class="block px-4 py-2 text-gray-800 hover:bg-[#d4a373] hover:text-[#faedcd]"
                @click="closeDropdown">
                Favorite
              </RouterLink>
              <RouterLink to="/orders" class="block px-4 py-2 text-gray-800 hover:bg-[#d4a373] hover:text-[#faedcd]"
                @click="closeDropdown">
                Comenzi
              </RouterLink>
              <button class="w-full text-left px-4 py-2 text-gray-800 hover:bg-[#d4a373] hover:text-[#faedcd]"
                @click="logout">
                Logout
              </button>
            </div>
          </div>
        </template>
        <template v-else>
          <RouterLink
            class="py-2 px-4 bg-[#faedcd] hover:bg-[#d4a373] hover:text-[#faedcd] text-sm text-[#d4a373] font-bold rounded-xl transition duration-700 whitespace-nowrap"
            :to="{ name: 'signup' }">
            Sign Up
          </RouterLink>
          <RouterLink
            class="py-2 px-4 bg-[#faedcd] hover:bg-[#d4a373] hover:text-[#faedcd] text-sm text-[#d4a373] font-bold rounded-xl transition duration-700"
            :to="{ name: 'login' }">
            Login
          </RouterLink>
        </template>
      </template>
    </div>

    <!-- Meniu mobil -->
    <transition name="fade">
      <ul
        v-if="showMobileMenu"
        class="fixed top-24 left-0 w-full bg-white dark:bg-[#23262f] shadow-lg flex flex-col items-center space-y-2 py-4 z-40 lg:hidden"
      >
        <li v-for="tab in tabs" :key="tab.key">
          <RouterLink
            class="block text-lg font-bold py-2 px-6 rounded hover:bg-[#d4a373] hover:text-[#faedcd] transition"
            :to="{ name: tab.key }"
            @click="showMobileMenu = false; updateTab(tab.key)"
          >
            {{ tab.label }}
          </RouterLink>
        </li>
      </ul>
    </transition>

    <!-- Gradient subtil jos pentru blur gradat -->
    <div
      v-if="scrolled && !ui.darkMode"
      class="pointer-events-none absolute left-0 bottom-0 w-full h-10"
      style="background: linear-gradient(to bottom, rgba(250,237,205,0) 0%, rgba(212,163,115,0.10) 100%); transition: opacity 0.5s;"
    ></div>
  </nav>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue'
import { RouterLink, useRoute } from 'vue-router'
import { getAuth, signOut, onAuthStateChanged } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import { useUIStore } from '@/stores/uiStore'
import { useCartStore } from '@/stores/cartStore'
import { useMessagesStore } from '@/stores/messagesStore'

const messagesStore = useMessagesStore()
const unreadCount = computed(() =>
  messagesStore.conversations.reduce(
    (sum, conv) =>
      sum +
      (conv.lastMessageRead === false && conv.lastMessageSenderId !== currentUser.value?.uid ? 1 : 0),
    0
  )
)

defineProps({
  selectedTab: String
})
const emit = defineEmits(['updateSelectedTab'])
function updateTab(tab) {
  emit('updateSelectedTab', tab)
}
const tabs = [
  { key: 'home', label: 'Acasă' },
  { key: 'shop', label: 'Magazin' },
  { key: 'learn', label: 'Învață' },
  { key: 'leaderboard', label: 'Clasament' },
  { key: 'exhibition', label: 'Expoziție' }
]
const route = useRoute()
const currentUser = ref(null)
const defaultAvatar = '/default-avatar.png'
const showDropdown = ref(false)
const scrolled = ref(false)
const ui = useUIStore()
const cartStore = useCartStore()
const showMobileMenu = ref(false)
const userLoading = ref(true)
const userPhotoURL = ref(localStorage.getItem('userPhotoURL') || defaultAvatar)

const activeCartCount = computed(() =>
  cartStore.products.filter(
    p => p.status !== 'completed' && p.status !== 'removed'
  ).length
)

function closeDropdown() {
  showDropdown.value = false
}

function handleClickOutside(event) {
  if (
    !event.target.closest('#profileDropdown') &&
    !event.target.closest('.profile-toggle')
  ) {
    closeDropdown()
  }
}

async function logout() {
  const auth = getAuth()
  await signOut(auth)
  cartStore.products = [] // curăță badge-ul la logout
  window.location.reload()
}

function onScroll() {
  scrolled.value = window.scrollY > 10
}

onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, async (user) => {
    currentUser.value = user
    userLoading.value = false
    if (user) {
      const userDoc = await getDoc(doc(db, 'users', user.uid))
      if (userDoc.exists()) {
        userPhotoURL.value = userDoc.data().photoURL || user.photoURL || defaultAvatar
        localStorage.setItem('userPhotoURL', userPhotoURL.value)
      } else {
        userPhotoURL.value = user.photoURL || defaultAvatar
        localStorage.setItem('userPhotoURL', userPhotoURL.value)
      }
      cartStore.listenToCart()
    } else {
      userPhotoURL.value = defaultAvatar
      localStorage.setItem('userPhotoURL', defaultAvatar)
      cartStore.products = []
      if (cartStore._unsubscribeCart) cartStore._unsubscribeCart()
    }
  })
  document.addEventListener('click', handleClickOutside)
  window.addEventListener('scroll', onScroll)
  messagesStore.fetchConversations()
})

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside)
  window.removeEventListener('scroll', onScroll)
})
</script>

<style scoped>
.active-tab {
  background-color: #443429 !important;
  color: #faedcd !important;
  transition: background 0.2s, color 0.2s;
}

.navbar-hover:hover {
  background-color: #443429 !important;
  color: #faedcd !important;
  transition: background 0.2s, color 0.2s;
}

.profile-toggle {
  width: 40px;
  height: 40px;
  padding: 0;
  border-radius: 50%;
  overflow: hidden;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  vertical-align: middle;
}

.profile-toggle img {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.fade-enter-active, .fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from, .fade-leave-to {
  opacity: 0;
}

nav.dark.backdrop-blur-lg {
  box-shadow: none !important;
}

nav, .active-tab, .navbar-hover, .profile-toggle, .fade-enter-active, .fade-leave-active {
  transition: background-color 0.8s cubic-bezier(.4,0,.2,1), color 0.8s cubic-bezier(.4,0,.2,1), box-shadow 0.4s cubic-bezier(.4,0,.2,1);
}

@media (max-width: 640px) {
  nav {
    height: 56px !important;
    min-height: 56px !important;
    padding-right: 0.5rem !important;
    padding-left: 0.5rem !important;
  }
  .flex-shrink-0 img {
    height: 88px !important; /* Mărit logo-ul */
    width: auto !important;
    margin-left: 0 !important;
  }
  /* Redimensionare butoane acțiuni */
  .flex.items-center.space-x-2 > button,
  .flex.items-center.space-x-2 > a.relative {
    width: 32px !important; /* de la 40px */
    height: 32px !important; /* de la 40px */
    padding: 4px !important;
  }
  .flex.items-center.space-x-2 > .relative > .profile-toggle,
  .flex.items-center.space-x-2 > .relative > .profile-toggle > img {
    width: 32px !important;
    height: 32px !important;
  }
  .flex.items-center.space-x-2 svg {
    width: 20px !important; /* de la 24px */
    height: 20px !important; /* de la 24px */
  }
}
</style>

<link rel="preload" as="image" href="/images/LogoWM2.png">
<link rel="preload" as="image" href="/images/LogoDM.png">
