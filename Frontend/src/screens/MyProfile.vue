<template>
  <div class="profile-container relative">
    <!-- Imagine și nume profil -->
    <img
      :src="photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(name || 'User')}&background=eee&color=bbb&size=120`"
      alt="Profile Image"
      class="profile-image"
    />

    <div class="profile-name flex items-center justify-center gap-2">
      {{ name || 'No Name' }}
      <span class="flex items-center gap-1 text-[#d4a373] font-semibold text-lg">
        <svg class="w-5 h-5" fill="#f55f09" viewBox="0 0 20 20">
          <path
            d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
          />
        </svg>
        {{ totalLikes }}
      </span>
    </div>

    <!-- Buton logout -->
    <div class="w-full mb-4">
      <button
        @click="logout"
        class="group relative flex items-center justify-center mx-auto px-6 py-2 bg-[#fef3ec] text-[#b5838d] border-2 border-[#d4a373] rounded-full font-semibold shadow transition-all duration-200 hover:bg-[#d4a373] hover:text-white hover:scale-105 focus:outline-none"
      >
        <svg class="w-5 h-5 mr-2 transition-colors duration-200 group-hover:text-white" fill="none"
          stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round"
            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a2 2 0 01-2 2H7a2 2 0 01-2-2V7a2 2 0 012-2h4a2 2 0 012 2v1" />
        </svg>
        Logout
      </button>
    </div>

    <!-- Tabs -->
    <div class="flex justify-center gap-4 sm:gap-8 mt-8 mb-8">
      <button
        :class="[
          'group relative flex items-center justify-center px-6 py-2 border-2 rounded-full font-semibold shadow transition-all duration-200 focus:outline-none',
          activeTab === 'my'
            ? 'bg-[#d4a373] text-white border-[#d4a373] scale-105'
            : 'bg-[#fef3ec] text-[#b5838d] border-[#d4a373] hover:bg-[#d4a373] hover:text-white hover:scale-105'
        ]"
        @click="activeTab = 'my'"
      >
        Anunțurile mele
      </button>
      <button
        :class="[
          'group relative flex items-center justify-center px-6 py-2 border-2 rounded-full font-semibold shadow transition-all duration-200 focus:outline-none',
          activeTab === 'fav'
            ? 'bg-[#d4a373] text-white border-[#d4a373] scale-105'
            : 'bg-[#fef3ec] text-[#b5838d] border-[#d4a373] hover:bg-[#d4a373] hover:text-white hover:scale-105'
        ]"
        @click="activeTab = 'fav'"
      >
        Favorite
      </button>
    </div>

    <!-- Afișare produse -->
    <div v-if="activeTab === 'my'">
      <div v-if="loadingProducts">Se încarcă anunțurile...</div>
      <div v-else>
        <div v-if="products.length === 0" class="text-gray-400 mt-8 text-lg">Nu ai publicat niciun anunț.</div>
        <div v-else class="mt-8">
          <div class="w-full flex justify-center">
            <div class="flex flex-wrap justify-center gap-6">
              <CraftyCard v-for="prod in products" :key="prod.id" :product="prod" @like="handleLike" />
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      <div class="mt-8">
        <div v-if="favoriteProducts.length === 0" class="text-gray-400 text-lg">Nu ai produse favorite.</div>
        <div v-else class="w-full flex justify-center">
          <div class="flex flex-wrap justify-center gap-6" style="max-width: 1800px;">
            <CraftyCard v-for="prod in favoriteProducts" :key="prod.id" :product="prod" @like="handleLike" />
          </div>
        </div>
      </div>
    </div>

    <!-- Dropdown-ul cu 3 puncte -->
    <div class="absolute top-4 right-4 z-10">
      <div class="relative">
        <button @click="showMenu = !showMenu" class="p-2 rounded-full hover:bg-[#fef3ec] transition" ref="menuBtn">
          <svg xmlns="http://www.w3.org/2000/svg" class="w-6 h-6 text-[#b5838d]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <circle cx="12" cy="6" r="1.5"/>
            <circle cx="12" cy="12" r="1.5"/>
            <circle cx="12" cy="18" r="1.5"/>
          </svg>
        </button>
        <div
          v-if="showMenu"
          class="absolute right-0 mt-2 w-40 bg-white border border-[#d4a373] rounded-lg shadow-lg z-20"
          ref="menuDropdown"
        >
          <button
            @click="deleteAccount"
            class="block w-full text-left px-4 py-2 text-red-600 hover:bg-[#fef3ec] rounded-lg"
          >
            Șterge contul
          </button>
        </div>
      </div>
    </div>

    <!-- Sticky Add Product Button -->
    <ButtonAdd />
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount } from 'vue'
import { getAuth, onAuthStateChanged, signOut, EmailAuthProvider, reauthenticateWithCredential, deleteUser } from 'firebase/auth'
import { collection, query, where, getDocs, doc, getDoc, deleteDoc, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import { useRouter } from 'vue-router'
import CraftyCard from '../components/CraftyCard.vue'
import ButtonAdd from '@/components/ButtonAdd.vue'

export default {
  components: { CraftyCard, ButtonAdd },
  setup() {
    const name = ref('')
    const photoURL = ref('')
    const loading = ref(true)
    const products = ref([])
    const loadingProducts = ref(true)
    const favoriteProducts = ref([])
    const loadingFavorites = ref(true)
    const router = useRouter()
    const activeTab = ref('my')
    const totalLikes = ref(0)
    const showMenu = ref(false)
    const menuBtn = ref(null)
    const menuDropdown = ref(null)

    const logout = async () => {
      const auth = getAuth()
      await signOut(auth)
      router.push({ name: 'login' })
    }

    // Calculează totalul aprecierilor pentru userul curent
    const calculateTotalLikes = async (userId) => {
      let likes = 0
      const q = query(collection(db, 'products'), where('userId', '==', userId))
      const querySnapshot = await getDocs(q)
      querySnapshot.forEach(doc => {
        const data = doc.data()
        if (Array.isArray(data.likedBy)) {
          likes += data.likedBy.length
        }
      })
      totalLikes.value = likes
    }

    onMounted(() => {
      const auth = getAuth()
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          // Citește datele userului din Firestore!
          const userDoc = await getDoc(doc(db, 'users', user.uid))
          const userData = userDoc.exists() ? userDoc.data() : {}
          name.value = userData.displayName || user.displayName || ''
          photoURL.value = userData.photoURL || user.photoURL || ''
          const q = query(collection(db, 'products'), where('userId', '==', user.uid))
          const querySnapshot = await getDocs(q)
          products.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

          // Ia toate produsele unde likedBy conține user.uid
          const productsSnapshot = await getDocs(collection(db, 'products'))
          favoriteProducts.value = productsSnapshot.docs
            .map(doc => ({ id: doc.id, ...doc.data() }))
            .filter(prod => Array.isArray(prod.likedBy) && prod.likedBy.includes(user.uid))

          // Calculează totalul aprecierilor
          await calculateTotalLikes(user.uid)
        } else {
          products.value = []
          favoriteProducts.value = []
          totalLikes.value = 0
        }
        loading.value = false
        loadingProducts.value = false
        loadingFavorites.value = false
      })
    })

    async function handleDeleteProduct(productId) {
      const confirmExpo = await new Promise(resolve => {
        const resp = window.confirm('Vrei să muți produsul în expoziție? Apasă OK pentru expoziție, Cancel pentru ștergere definitvă.')
        resolve(resp)
      })
      if (confirmExpo) {
        await updateDoc(doc(db, 'products', productId), { expo: true })
        products.value = products.value.filter(p => p.id !== productId)
      } else {
        await deleteDoc(doc(db, 'products', productId))
        products.value = products.value.filter(p => p.id !== productId)
        favoriteProducts.value = favoriteProducts.value.filter(p => p.id !== productId)
      }
    }

    const deleteAccount = async () => {
      const auth = getAuth()
      const user = auth.currentUser
      if (!user) return

      const password = prompt('Pentru a șterge contul, introdu parola ta:')
      if (!password) return

      try {
        const credential = EmailAuthProvider.credential(user.email, password)
        await reauthenticateWithCredential(user, credential)
        await deleteDoc(doc(db, 'users', user.uid))
        await deleteUser(user)
        alert('Contul a fost șters cu succes.')
        window.location.href = '/'
      } catch (e) {
        if (e.code === 'auth/wrong-password') {
          alert('Parolă greșită. Contul nu a fost șters.')
        } else {
          alert('Eroare la ștergerea contului: ' + (e.message || e))
        }
      }
    }

    // Click outside logic pentru dropdown
    function handleClickOutside(event) {
      if (
        showMenu.value &&
        menuDropdown.value &&
        !menuDropdown.value.contains(event.target) &&
        menuBtn.value &&
        !menuBtn.value.contains(event.target)
      ) {
        showMenu.value = false
      }
    }

    onMounted(() => {
      document.addEventListener('mousedown', handleClickOutside)
    })
    onBeforeUnmount(() => {
      document.removeEventListener('mousedown', handleClickOutside)
    })

    const auth = getAuth()
    const user = auth.currentUser

    // --- LIKE HANDLER ---
    async function handleLike(productId, shouldLike) {
      if (!user) {
        alert('Trebuie să fii logat ca să poți adăuga la favorite!')
        return
      }
      const prodRef = doc(db, 'products', productId)
      if (shouldLike) {
        await updateDoc(prodRef, { likedBy: arrayUnion(user.uid) })
        let prod = products.value.find(p => p.id === productId)
        if (prod && (!prod.likedBy || !prod.likedBy.includes(user.uid))) {
          if (!prod.likedBy) prod.likedBy = []
          prod.likedBy.push(user.uid)
        }
        prod = favoriteProducts.value.find(p => p.id === productId)
        if (prod && (!prod.likedBy || !prod.likedBy.includes(user.uid))) {
          if (!prod.likedBy) prod.likedBy = []
          prod.likedBy.push(user.uid)
        }
      } else {
        await updateDoc(prodRef, { likedBy: arrayRemove(user.uid) })
        let prod = products.value.find(p => p.id === productId)
        if (prod && prod.likedBy) {
          prod.likedBy = prod.likedBy.filter(uid => uid !== user.uid)
        }
        prod = favoriteProducts.value.find(p => p.id === productId)
        if (prod && prod.likedBy) {
          prod.likedBy = prod.likedBy.filter(uid => uid !== user.uid)
        }
      }
    }

    return {
      name,
      photoURL,
      loading,
      logout,
      products,
      loadingProducts,
      favoriteProducts,
      loadingFavorites,
      activeTab,
      totalLikes,
      handleDeleteProduct,
      deleteAccount,
      showMenu,
      menuBtn,
      menuDropdown,
      handleLike
    }
  }
}
</script>

<style scoped>
.profile-container {
  max-width: 90%;
  margin: 40px auto;
  padding: 32px 24px;
  border-radius: 16px;
  background: #fff;
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
}

.profile-image {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  margin-bottom: 16px;
  border: 2px solid #eee;
  display: block;
  margin-left: auto;
  margin-right: auto;
}

.profile-name {
  font-size: 1.5rem;
  font-weight: 600;
  margin-bottom: 8px;
  text-align: center;
  color: #583826;
}

.dark .profile-name {
  color: #fff !important;
}

.dark .profile-container {
  background: #583826 !important;
}
</style>
