<template>
  <div>
    <div
      class="tracking-in-contract flex mt-8 mb-8 text-[2rem] md:text-[3rem] lg:text-[4rem] justify-center text-center font-bold"
      :class="isDark ? 'text-white' : 'text-[#583826]'"
    >
      {{ activeTab === 'users'
        ? 'Clasamentul celor mai apreciați vânzători'
        : 'Clasamentul celor mai apreciate creații' }}
    </div>

    <!-- Butoane de comutare cu iconiță sortare animată și spațiere dinamică -->
    <div class="flex justify-center gap-4 mb-10 relative">
      <div class="relative flex items-center">
        <button
          @click="activeTab = 'users'"
          :class="[
            'group relative flex items-center justify-center gap-2 px-6 py-3 border-2 rounded-full font-semibold shadow-lg transition-all duration-200 focus:outline-none text-lg',
            activeTab === 'users'
              ? 'bg-[#d4a373] text-white border-[#d4a373] scale-105'
              : 'bg-[#fef3ec] text-[#b5838d] border-[#d4a373] hover:bg-[#d4a373] hover:text-white hover:scale-105'
          ]"
          style="box-shadow: 0 6px 32px 0 rgba(212,163,115,0.25);"
        >
          Top vânzători
        </button>
        <transition name="fade-move" mode="out-in">
          <button
            v-if="activeTab === 'users'"
            @click="sortDescending = !sortDescending"
            key="users-arrow"
            class="absolute -right-10 left-auto top-1/2 -translate-y-1/2 bg-transparent border-none p-0 m-0 cursor-pointer transition-all duration-300"
            style="z-index:2;"
            aria-label="Schimbă ordinea"
          >
            <svg
              v-if="sortDescending"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="#d4a373"
              class="w-7 h-7"
              style="filter: drop-shadow(0 2px 6px #d4a37333);"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="#d4a373"
              class="w-7 h-7"
              style="filter: drop-shadow(0 2px 6px #d4a37333);"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        </transition>
      </div>
      <div
        class="relative flex items-center transition-all duration-300"
        :style="activeTab === 'users' ? 'margin-left:40px;' : ''"
      >
        <button
          @click="activeTab = 'products'"
          :class="[
            'group relative flex items-center justify-center gap-2 px-6 py-3 border-2 rounded-full font-semibold shadow-lg transition-all duration-200 focus:outline-none text-lg',
            activeTab === 'products'
              ? 'bg-[#d4a373] text-white border-[#d4a373] scale-105'
              : 'bg-[#fef3ec] text-[#b5838d] border-[#d4a373] hover:bg-[#d4a373] hover:text-white hover:scale-105'
          ]"
          style="box-shadow: 0 6px 32px 0 rgba(212,163,115,0.25);"
        >
          Top creații
        </button>
        <transition name="fade-move" mode="out-in">
          <button
            v-if="activeTab === 'products'"
            @click="sortDescending = !sortDescending"
            key="products-arrow"
            class="absolute -right-10 left-auto top-1/2 -translate-y-1/2 bg-transparent border-none p-0 m-0 cursor-pointer transition-all duration-300"
            style="z-index:2;"
            aria-label="Schimbă ordinea"
          >
            <svg
              v-if="sortDescending"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="#d4a373"
              class="w-7 h-7"
              style="filter: drop-shadow(0 2px 6px #d4a37333);"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
            <svg
              v-else
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="#d4a373"
              class="w-7 h-7"
              style="filter: drop-shadow(0 2px 6px #d4a37333);"
            >
              <path stroke-linecap="round" stroke-linejoin="round" d="m4.5 15.75 7.5-7.5 7.5 7.5" />
            </svg>
          </button>
        </transition>
      </div>
    </div>

    <div class="flex flex-col gap-6 max-w-lg mx-auto my-8">
      <!-- Top vânzători -->
      <template v-if="activeTab === 'users'">
        <div
          v-for="(user, idx) in sortedUsers"
          :key="user.id"
          @click="goToUserProfile(user.id)"
          class="flex items-center px-4 py-2 bg-white rounded-2xl shadow-lg transition hover:shadow-xl relative cursor-pointer"
          style="min-height: 56px;"
        >
          <span
            class="absolute -left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-[#faedcd] text-[#b5838d] font-bold text-base shadow"
            style="z-index:2;"
          >
            {{ idx + 1 }}
          </span>
          <img
            :src="user.photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.displayName || 'User')}&background=eee&color=bbb&size=64`"
            alt="avatar"
            class="w-10 h-10 rounded-full object-cover mr-4"
          />
          <span
            class="font-semibold mr-auto text-[#7f5539] text-base"
          >{{ user.displayName || 'Fără nume' }}</span>
          <span class="font-bold flex items-center text-[#f55f09] text-base">
            <svg class="w-5 h-5 mr-1" fill="#f55f09" viewBox="0 0 20 20">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
            </svg>
            {{ user.totalLikes }}
          </span>
        </div>
      </template>
      <!-- Top creații -->
      <template v-else>
        <div
          v-for="(product, idx) in sortedProducts"
          :key="product.id"
          @click="goToProduct(product.id)"
          class="flex items-center px-4 py-2 bg-white rounded-2xl shadow-lg transition hover:shadow-xl relative cursor-pointer"
          style="min-height: 56px;"
        >
          <span
            class="absolute -left-4 top-1/2 -translate-y-1/2 flex items-center justify-center w-7 h-7 rounded-full bg-[#faedcd] text-[#b5838d] font-bold text-base shadow"
            style="z-index:2;"
          >
            {{ idx + 1 }}
          </span>
          <img
            :src="product.images?.[0] || product.imageURL || 'https://via.placeholder.com/64x64?text=Produs'"
            alt="produs"
            class="w-10 h-10 rounded-full object-cover mr-4"
          />
          <span class="font-semibold mr-auto text-[#7f5539] text-base truncate" style="max-width: 260px;">
            {{ product.name }}
          </span>
          <span class="font-bold flex items-center text-[#f55f09] text-base">
            <svg class="w-5 h-5 mr-1" fill="#f55f09" viewBox="0 0 20 20">
              <path d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"/>
            </svg>
            {{ product.likedBy ? product.likedBy.length : 0 }}
          </span>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import { useUIStore } from '@/stores/uiStore'
import { getAuth } from 'firebase/auth'

const ui = useUIStore()
const isDark = computed(() => ui.darkMode)
const router = useRouter()
const auth = getAuth()
const currentUserId = auth.currentUser?.uid

const users = ref([])
const products = ref([])
const sortDescending = ref(true)
const activeTab = ref('users') // 'users' sau 'products'

// Top creații: toate produsele sortate după like-uri
const sortedProducts = computed(() =>
  [...products.value].sort((a, b) => {
    const likesA = a.likedBy?.length || 0
    const likesB = b.likedBy?.length || 0
    return sortDescending.value ? likesB - likesA : likesA - likesB
  }).slice(0, 20)
)

const sortedUsers = computed(() => {
  return [...users.value].sort((a, b) => {
    return sortDescending.value
      ? b.totalLikes - a.totalLikes
      : a.totalLikes - b.totalLikes
  })
})

function goToProduct(id) {
  router.push({ name: 'product-detail', params: { id } })
}

function goToUserProfile(id) {
  if (currentUserId && id === currentUserId) {
    router.push({ name: 'profile' }) // sau 'myprofile', după cum ai definit ruta
  } else {
    router.push({ name: 'user-profile', params: { id } })
  }
}

onMounted(async () => {
  // Users + totalLikes
  const usersSnapshot = await getDocs(collection(db, 'users'))
  const usersList = usersSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data(), totalLikes: 0 }))
  const productsSnapshot = await getDocs(collection(db, 'products'))
  products.value = productsSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  productsSnapshot.docs.forEach(doc => {
    const prod = doc.data()
    const owner = usersList.find(u => u.id === prod.userId)
    if (owner) {
      owner.totalLikes += Array.isArray(prod.likedBy) ? prod.likedBy.length : 0
    }
  })
  users.value = usersList
})
</script>

<style>
.fade-move-enter-active, .fade-move-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-move-enter-from, .fade-move-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>
