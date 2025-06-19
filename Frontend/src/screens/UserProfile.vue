<template>
  <div class="max-w-3xl mx-auto mt-12 mb-12">
    <div class="flex flex-col items-center mb-8">
      <img
        :src="user?.photoURL || '/default-avatar.png'"
        class="w-28 h-28 rounded-full object-cover border-4 border-[#faedcd] shadow-lg mb-4"
        alt="avatar"
      />
      <div
        class="text-2xl font-bold mb-1 user-profile-name"
        :style="isDark ? 'color: #fff !important;' : 'color: #583826 !important;'"
      >
        {{ user?.displayName || user?.name || 'Utilizator' }}
      </div>
    </div>
    <div>
      <div v-if="loading" class="text-center text-gray-400">Se încarcă...</div>
      <div v-else-if="products.length === 0" class="text-center text-gray-400">Acest utilizator nu a publicat încă niciun anunț.</div>
      <div v-else class="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <CraftyCard
          v-for="product in products"
          :key="product.id"
          :product="product"
          :isProfile="true"
          @like="handleLike"
          @buy-product="handleBuy"
          @delete-product="handleDeleteProduct"
        />
      </div>
    </div>
    <NotificationAddToCart
      v-if="showNotif"
      @close="showNotif = false"
      @gotoCart="goToCart"
    />
    <!-- Adaugă butonul undeva vizibil pentru user -->
    <button
      v-if="isOwnProfile"
      @click="deleteAccount"
      class="mt-4 px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition"
    >
      Șterge contul
    </button>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, collection, query, where, getDocs, updateDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import CraftyCard from '@/components/CraftyCard.vue'
import { getAuth, deleteUser, onAuthStateChanged } from 'firebase/auth'
import { useCartStore } from '@/stores/cartStore'
import NotificationAddToCart from '@/components/NotificationAddToCart.vue'
import { useUIStore } from '@/stores/uiStore'

const route = useRoute()
const router = useRouter()
const user = ref(null) // userul profilului vizitat
const products = ref([])
const loading = ref(true)
const auth = getAuth()
const cartStore = useCartStore()
const showNotif = ref(false)

const loggedUser = ref(null) // userul logat
onAuthStateChanged(auth, (u) => {
  loggedUser.value = u
})

const ui = useUIStore()
const isDark = computed(() => ui.darkMode)

onMounted(async () => {
  await fetchData()
})

async function fetchData() {
  const userId = route.params.id
  loading.value = true
  // Fetch user
  const userDoc = await getDoc(doc(db, 'users', userId))
  if (userDoc.exists()) {
    user.value = userDoc.data()
  }
  // Fetch products
  const q = query(collection(db, 'products'), where('userId', '==', userId))
  const snap = await getDocs(q)
  products.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  loading.value = false
}

// Actualizare instant la like
async function handleLike(productId, liked) {
  const userId = loggedUser.value?.uid
  if (!userId) {
    alert('Trebuie să fii logat ca să poți adăuga la favorite!')
    return
  }
  const prodRef = doc(db, 'products', productId)
  // Update Firebase
  await updateDoc(prodRef, {
    likedBy: liked ? arrayUnion(userId) : arrayRemove(userId)
  })
  // Update local
  const idx = products.value.findIndex(p => p.id === productId)
  if (idx !== -1) {
    const arr = products.value[idx].likedBy || []
    if (liked && !arr.includes(userId)) arr.push(userId)
    if (!liked) products.value[idx].likedBy = arr.filter(uid => uid !== userId)
    else products.value[idx].likedBy = arr
    // Trigger reactivitate
    products.value = [...products.value]
  }
}

// Adaugă în coș și notifică
async function handleBuy(product) {
  await cartStore.addProductToCart(product)
  showNotif.value = true
}

function goToCart() {
  showNotif.value = false
  router.push({ name: 'cart' })
}

// Folosește acest handler peste tot unde ai ștergere produs
import { deleteDoc } from 'firebase/firestore'

async function handleDeleteProduct(productId, afterAction) {
  const confirmExpo = await new Promise(resolve => {
    const resp = window.confirm('Vrei să muți produsul în expoziție? Apasă OK pentru expoziție, Cancel pentru ștergere definitivă.')
    resolve(resp)
  })
  if (confirmExpo) {
    await updateDoc(doc(db, 'products', productId), { expo: true })
    if (afterAction) afterAction('expo')
  } else {
    await deleteDoc(doc(db, 'products', productId))
    if (afterAction) afterAction('delete')
  }
}

// Șterge contul utilizatorului
async function deleteAccount() {
  if (!confirm('Ești sigur că vrei să ștergi contul? Această acțiune este ireversibilă!')) return
  const auth = getAuth()
  const user = auth.currentUser
  if (!user) return

  try {
    // Șterge userul din Firestore
    await deleteDoc(doc(db, 'users', user.uid))
    // Șterge userul din Firebase Auth
    await deleteUser(user)
    alert('Contul a fost șters cu succes.')
    // Redirecționează către homepage sau login
    window.location.href = '/'
  } catch (e) {
    alert('Eroare la ștergerea contului: ' + (e.message || e))
  }
}

const isOwnProfile = computed(() => {
  return loggedUser.value && route.params.id === loggedUser.value.uid
})
</script>
