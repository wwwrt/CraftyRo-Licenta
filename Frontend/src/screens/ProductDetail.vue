<template>
  <div class="max-w-3xl mx-auto mt-12 mb-12 bg-white rounded-3xl shadow-2xl overflow-hidden">
    <div class="flex flex-col md:flex-row">
      <!-- Imagine produs -->
      <div class="md:w-1/2 bg-[#faedcd] flex items-center justify-center p-8">
        <div v-if="product.images && product.images.length" class="relative w-full max-w-xs">
          <img
            :src="product.images[currentImageIndex]"
            alt="Product Image"
            class="rounded-2xl shadow-lg w-full h-80 object-cover transition-transform duration-300 ease-in-out"
          />
          <button
            v-if="product.images.length > 1"
            @click="prevImage"
            class="absolute left-0 top-1/2 -translate-y-1/2 bg-[#d4a373] text-white rounded-full p-2 shadow"
            style="z-index:2"
          >&lt;</button>
          <button
            v-if="product.images.length > 1"
            @click="nextImage"
            class="absolute right-0 top-1/2 -translate-y-1/2 bg-[#d4a373] text-white rounded-full p-2 shadow"
            style="z-index:2"
          >&gt;</button>
          <div class="flex justify-center gap-1 mt-2">
            <span
              v-for="(img, idx) in product.images"
              :key="idx"
              class="inline-block w-2 h-2 rounded-full"
              :class="currentImageIndex === idx ? 'bg-[#d4a373]' : 'bg-gray-300'"
            ></span>
          </div>
        </div>
        <img
          v-else
          :src="product.imageURL || 'https://via.placeholder.com/400x400?text=Imagine+Produs'"
          alt="Product Image"
          class="rounded-2xl shadow-lg w-full max-w-xs h-80 object-cover"
        />
      </div>
      <!-- Detalii produs -->
      <div class="md:w-1/2 p-8 flex flex-col gap-4">
        <h1 class="text-3xl font-extrabold text-[#7f5539] mb-2">{{ product.name }}</h1>
        <div class="flex items-center gap-3 mb-2">
          <span class="text-2xl text-[#d4a373] font-bold">{{ product.price }} lei</span>
          <button
            v-if="currentUserId && sellerId !== currentUserId"
            @click="toggleLike"
            :aria-label="likedByMe ? 'Retrage like' : 'Apreciază produsul'"
            class="focus:outline-none"
          >
            <svg
              :fill="likedByMe ? '#f55f09' : 'none'"
              :stroke="likedByMe ? '#f55f09' : 'currentColor'"
              viewBox="0 0 20 20"
              class="w-7 h-7 transition"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3.172 5.172a4 4 0 015.656 0L10 6.343l1.172-1.171a4 4 0 115.656 5.656L10 17.657l-6.828-6.829a4 4 0 010-5.656z"
              />
            </svg>
          </button>
          <span class="flex items-center gap-1 text-[#b5838d] font-semibold">
            {{ product.likedBy ? product.likedBy.length : 0 }}
          </span>
        </div>
        <div class="flex flex-wrap gap-4 text-sm text-gray-600 mb-2">
          <span class="bg-[#faedcd] px-3 py-1 rounded-full font-medium">
            <b>Categorie:</b> {{ product.categoryLabel || product.category }}
          </span>
          <span v-if="!product.expo" class="bg-[#faedcd] px-3 py-1 rounded-full font-medium">
            <b>Stoc:</b> {{ product.stock }}
          </span>
          <span class="bg-[#faedcd] px-3 py-1 rounded-full font-medium">
            <b>Locație:</b> {{ product.location || 'Nespecificată' }}
          </span>
        </div>
        <div class="flex items-center gap-2 mb-2">
          <span class="font-semibold text-[#7f5539]">Vânzător:</span>
          <span
            class="text-[#b5838d] cursor-pointer hover:underline"
            @click="goToUserProfile(sellerId)"
          >
            {{ sellerName || 'Nespecificat' }}
          </span>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-[#7f5539] mb-1">Descriere</h2>
          <p class="text-gray-700">{{ product.description || 'Nu există descriere pentru acest produs.' }}</p>
        </div>
        <div v-if="product.tutorial" class="bg-[#e7c8a0]/40 rounded-lg p-3 mt-2">
          <h2 class="text-base font-semibold text-[#7f5539] mb-1">Tutorial</h2>
          <a :href="product.tutorial" target="_blank" class="text-[#d4a373] underline hover:text-[#7f5539] transition">Vezi tutorialul</a>
        </div>
        <div class="flex justify-center mt-6">
          <button
            v-if="sellerId !== currentUserId && !product.expo"
            @click="handleAddToCart(product)"
            class="px-8 py-3 bg-[#d4a373] hover:bg-[#7f5539] text-white font-bold rounded-lg shadow transition-all duration-200 ease-in-out text-lg"
          >
            Adaugă în coș
          </button>
        </div>
        <!-- Buton trimite mesaj vânzătorului -->
        <div v-if="!product.expo" class="flex justify-center mt-4">
          <button
            v-if="sellerId && currentUserId && sellerId !== currentUserId"
            @click="startConversation"
            class="px-6 py-2 bg-[#d4a373] hover:bg-[#7f5539] text-white font-bold rounded-lg shadow transition-all duration-200 ease-in-out text-base"
          >
            Trimite mesaj vânzătorului
          </button>
        </div>
        <!-- Adaugă acest buton doar dacă produsul este al userului curent -->
        <div class="flex justify-end" v-if="sellerId === currentUserId">
          <button
            class="edit-btn transition-colors duration-200 w-10 h-10 flex items-center justify-center rounded-full shadow-md"
            @click="onDeleteProduct"
            title="Șterge produs"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
    </div>
    <NotificationAddToCart
      v-if="showCartNotification"
      @close="showCartNotification = false"
      @gotoCart="goToCart"
      :product="lastAddedProduct"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, collection, query, where, getDocs, addDoc, serverTimestamp, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import NotificationAddToCart from '@/components/NotificationAddToCart.vue'
import { useCartStore } from '@/stores/cartStore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'

const route = useRoute()
const router = useRouter()
const cartStore = useCartStore()
const product = ref({})
const sellerName = ref('')
const currentUserId = ref('')
const sellerId = ref('')
const showCartNotification = ref(false)
const lastAddedProduct = ref(null)
const currentImageIndex = ref(0)

const auth = getAuth()
onAuthStateChanged(auth, (user) => {
  if (user) currentUserId.value = user.uid
})

// Categoriile disponibile pentru produse
const categories = [
  { key: 'decor', label: 'Decorațiuni' },
  { key: 'bijuterii', label: 'Bijuterii' },
  { key: 'haine', label: 'Haine' },
  { key: 'papetarie', label: 'Papetărie' },
  { key: 'jucarii', label: 'Jucării' },
  { key: 'cadouri', label: 'Cadouri' },
  { key: 'arome', label: 'Arome & Lumânări' },
  { key: 'tablouri', label: 'Tablouri & Artă' },
  { key: 'cosmetice', label: 'Cosmetice naturale' },
  { key: 'ceramica', label: 'Ceramică' },
  { key: 'accesorii', label: 'Accesorii' },
  { key: 'eco', label: 'Eco & Zero Waste' },
  { key: 'altele', label: 'Altele' }
]

// Obține detaliile produsului la montare
onMounted(async () => {
  const productId = route.params.id
  try {
    const productDoc = await getDoc(doc(db, 'products', productId))
    if (productDoc.exists()) {
      const prod = { id: productDoc.id, ...productDoc.data() }
      prod.categoryLabel = categories.find(c => c.key === prod.category)?.label
      product.value = prod

      if (prod.userId) {
        sellerId.value = prod.userId
        const userDoc = await getDoc(doc(db, 'users', prod.userId))
        if (userDoc.exists()) {
          sellerName.value = userDoc.data().displayName || userDoc.data().name || 'Nespecificat'
        }
      }
    }
  } catch (error) {
    console.error('Failed to fetch product details:', error)
  }
})

// Funcție pentru a începe o conversație cu vânzătorul
async function startConversation() {
  // Caută dacă există deja conversația cu aceiași membri și același productId
  const convQuery = query(
    collection(db, 'conversations'),
    where('members', 'array-contains', currentUserId.value)
  )
  const convSnap = await getDocs(convQuery)
  let convId = null
  convSnap.forEach(docu => {
    const data = docu.data()
    // Verifică și productId!
    if (
      Array.isArray(data.members) &&
      data.members.includes(sellerId.value) &&
      data.members.includes(currentUserId.value) &&
      data.members.length === 2 &&
      data.productId === product.value.id // <-- comparație productId
    ) {
      convId = docu.id
    }
  })

  // Dacă nu există, creează conversația cu productId
  if (!convId) {
    const newConv = await addDoc(collection(db, 'conversations'), {
      members: [currentUserId.value, sellerId.value],
      productId: product.value.id, // <-- adaugă productId aici!
      lastMessage: '',
      lastUpdated: serverTimestamp()
    })
    convId = newConv.id
  }

  // Redirecționează către pagina de chat
  router.push({ 
    name: 'messages', 
    query: { 
      productId: product.value.id, 
      sellerId: sellerId.value 
    } 
  })
}

// Funcție pentru a adăuga produsul în coș
function handleAddToCart(product) {
  cartStore.addProductToCart(product)
  lastAddedProduct.value = product
  showCartNotification.value = true
}

// Funcție pentru a merge la pagina coșului
function goToCart() {
  router.push({ name: 'cart' })
}

// Funcție pentru a schimba imaginea produsului (următoarea)
function nextImage() {
  if (!product.value.images) return
  currentImageIndex.value =
    (currentImageIndex.value + 1) % product.value.images.length
}

// Funcție pentru a schimba imaginea produsului (anterioră)
function prevImage() {
  if (!product.value.images) return
  currentImageIndex.value =
    (currentImageIndex.value - 1 + product.value.images.length) % product.value.images.length
}

// Funcție pentru a merge la profilul utilizatorului
function goToUserProfile(id) {
  if (currentUserId.value && id === currentUserId.value) {
    router.push({ name: 'profile' }) // sau 'myprofile', după cum ai definit ruta
  } else {
    router.push({ name: 'user-profile', params: { id } })
  }
}

// Folosește acest handler peste tot unde ai ștergere produs
async function handleDeleteProduct(productId, afterAction) {
  const confirmExpo = await new Promise(resolve => {
    const resp = window.confirm('Vrei să muți produsul în expoziție? Apasă OK pentru expoziție, Cancel pentru ștergere definitvă.')
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

// Funcție pentru a șterge produsul
function onDeleteProduct() {
  handleDeleteProduct(product.value.id, (action) => {
    // Redirectează sau actualizează UI-ul după ștergere/expoziție
    if (action === 'delete' || action === 'expo') {
      router.push({ name: 'shop' }) // sau altă rută potrivită
    }
  })
}

// Computed property pentru a verifica dacă produsul este apreciat de utilizatorul curent
const likedByMe = computed(() =>
  product.value.likedBy && currentUserId.value
    ? product.value.likedBy.includes(currentUserId.value)
    : false
)

// Funcție pentru a schimba starea de like a produsului
async function toggleLike() {
  if (!currentUserId.value) {
    router.push({ name: 'login' })
    return
  }
  const prodRef = doc(db, 'products', product.value.id)
  if (likedByMe.value) {
    // Retrage like
    await updateDoc(prodRef, {
      likedBy: arrayRemove(currentUserId.value)
    })
    // Actualizează local (opțional, pentru UX instant)
    product.value.likedBy = product.value.likedBy.filter(uid => uid !== currentUserId.value)
  } else {
    // Adaugă like
    await updateDoc(prodRef, {
      likedBy: arrayUnion(currentUserId.value)
    })
    if (!product.value.likedBy) product.value.likedBy = []
    product.value.likedBy.push(currentUserId.value)
  }
}
</script>

<style scoped>
.max-w-2xl {
  max-width: 42rem;
}
.shadow-xl {
  box-shadow: 0 10px 32px 0 rgba(0,0,0,0.10), 0 2px 4px 0 rgba(0,0,0,0.08);
}
</style>
