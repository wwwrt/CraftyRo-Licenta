<template>
  <div>
    <!-- Titlu și descriere de la Exhibition -->
    <div class="flex flex-col items-center mb-8">
      <div
        class="flex mb-8 text-[2rem] md:text-[3rem] lg:text-[4rem] justify-center text-center"
        :class="isDark ? 'text-white' : 'text-[#583826]'"
      >
        Cele mai apreciate creații ale lunii {{ currentMonth }}
      </div>
      <p
        class="mt-4 max-w-2xl text-center text-lg md:text-2xl font-medium animate-fade-in-up"
        :class="isDark ? 'text-white' : 'text-[#583826]'"
      >
        Descoperă cele mai apreciate creații artizanale ale lunii! Inspiră-te din selecția noastră de produse unice, realizate cu pasiune și creativitate de artizani talentați.
      </p>
    </div>
    <!-- Carousel -->
    <CarouselShop :products="topProducts" />

    <!-- Bara de filtre cu padding sincronizat cu gridul de carduri -->
    <div class="w-full flex justify-center">
      <div class="w-full max-w-6xl flex flex-col md:flex-row md:items-center md:justify-between gap-3 mt-6 mb-6 px-2">
        <!-- Stânga: sortare + categorii -->
        <div class="flex flex-col sm:flex-row gap-3 w-full md:w-auto items-center justify-center md:items-start md:justify-start">
          <!-- Dropdown sortare -->
          <div class="relative">
            <button
              @click="showSortDropdown = !showSortDropdown"
              class="flex items-center gap-2 text-base font-semibold bg-[#fef3ec] text-[#7f5539] rounded-xl px-4 py-2 shadow-sm hover:bg-[#f55f09] hover:text-white transition focus:ring-2 focus:ring-[#d4a373] focus:outline-none"
              style="margin-left: 0.5rem;"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M16 17l-4 4m0 0l-4-4m4 4V3"/>
              </svg>
              <span class="text-[#7f5539]">Sortează</span>
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div
              v-if="showSortDropdown"
              class="absolute left-0 mt-2 w-44 bg-white border border-[#d4a373] rounded-xl shadow-lg z-10"
            >
              <button
                class="block w-full text-left px-4 py-2 hover:bg-[#faedcd] text-[#7f5539] rounded-t-xl transition"
                @click="sortProducts('name'); showSortDropdown = false"
              >După nume</button>
              <button
                class="block w-full text-left px-4 py-2 hover:bg-[#faedcd] text-[#7f5539] rounded-b-xl transition"
                @click="sortProducts('price'); showSortDropdown = false"
              >După preț</button>
            </div>
          </div>

          <!-- Dropdown categorii -->
          <div class="relative">
            <button
              @click="showCategoryDropdown = !showCategoryDropdown"
              class="flex items-center gap-2 text-base font-semibold bg-[#fef3ec] text-[#7f5539] rounded-xl px-4 py-2 shadow-sm hover:bg-[#f55f09] hover:text-white transition focus:ring-2 focus:ring-[#d4a373] focus:outline-none"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="10" /><path d="M8 12h8M12 8v8"/>
              </svg>
              <span class="text-[#7f5539]">{{ selectedCategoryLabel }}</span>
              <svg class="w-4 h-4 ml-1" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
            </button>
            <div
              v-if="showCategoryDropdown"
              class="absolute left-0 mt-2 w-56 bg-white border border-[#d4a373] rounded-xl shadow-lg z-10 max-h-64 overflow-y-auto"
            >
              <button
                v-for="cat in categories"
                :key="cat.key"
                @click="selectCategory(cat.key); showCategoryDropdown = false"
                class="block w-full text-left px-4 py-2 hover:bg-[#faedcd] text-[#7f5539] transition"
                :class="{ 'font-bold bg-[#faedcd]': selectedCategory === cat.key }"
              >
                <span class="mr-2">{{ cat.icon }}</span>{{ cat.label }}
              </button>
            </div>
          </div>
        </div>

        <!-- Dreapta: searchbar modern -->
        <div class="w-full md:w-auto flex justify-center md:justify-end">
          <div class="relative w-full md:w-72">
            <input
              v-model="searchQuery"
              type="text"
              placeholder="Caută produse..."
              class="w-full text-base px-4 py-2 rounded-xl bg-[#fef3ec] text-black placeholder-[#b5838d] shadow-sm focus:outline-none focus:ring-2 focus:ring-[#d4a373] transition border-0"
            />
            <svg class="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#b5838d]" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
              <circle cx="11" cy="11" r="8"/><path d="M21 21l-3.5-3.5"/>
            </svg>
          </div>
        </div>
      </div>
    </div>

    <!-- Grid-ul de carduri cu aceleași margini -->
    <div class="w-full flex justify-center">
      <div class="w-full max-w-6xl flex flex-wrap justify-center gap-4 mt-4">
        <CraftyCard
          v-for="product in visibleProducts"
          :key="product.id"
          :product="product"
          @buy-product="handleBuyProduct"
          @delete-product="handleDeleteProduct"
          @edit-product="handleEditProduct"
          @like="handleLike"
        />
      </div>
    </div>

    <div class="flex justify-center">
      <button
        v-if="!allProductsShown"
        @click="loadMore"
        class="mx-auto mt-5 mb-20 block text-base text-[#7f5539] hover:bg-[#d4a373] hover:text-white rounded px-3 py-1 font-bold border border-[#d4a373] transition"
      >
        Vezi mai multe
      </button>
      <p class="mt-5 mb-20 block text-center text-base text-[#7f5539] p-2 font-bold" v-else>
        Acestea sunt toate produsele
      </p>
    </div>

    <!-- Popup pentru selecția categoriei -->
    <div
      v-if="showCategoryPopup"
      class="fixed inset-0 z-50 flex items-center justify-center bg-black/40"
    >
      <div
        class="relative bg-white rounded-2xl shadow-2xl p-6 w-full max-w-3xl mx-4 max-h-[80vh] overflow-y-auto"
      >
        <button
          class="absolute top-4 right-6 text-2xl font-bold text-[#7f5539] hover:text-[#d4a373] transition"
          @click="showCategoryPopup = false"
        >&times;</button>
        <h3 class="text-2xl font-bold text-[#7f5539] mb-6 text-center">Alege o categorie</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
          <button
            v-for="cat in categories"
            :key="cat.key"
            @click="selectCategory(cat.key)"
            :class="[
              'px-3 py-2 rounded text-base font-semibold border transition',
              selectedCategory.value === cat.key
                ? 'bg-[#d4a373] text-white border-[#d4a373]'
                : 'bg-[#faedcd] text-[#7f5539] border-[#faedcd] hover:bg-[#d4a373] hover:text-white hover:border-[#d4a373]'
            ]"
          >
            {{ cat.label }}
          </button>
        </div>
      </div>
    </div>

    <!-- Notification for Add to Cart -->
    <NotificationAddToCart
      v-if="showCartNotification"
      @close="showCartNotification = false"
      @gotoCart="goToCart"
      :product="lastAddedProduct"
    />
    <ButtonAdd />
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebaseconfig' 
import CarouselShop from '/src/components/CarouselShop.vue'
import CraftyCard from '/src/components/CraftyCard.vue'
import { useProductsStore } from '../stores/productsStore'
import { useCartStore } from '../stores/cartStore'
import { useRouter } from 'vue-router'
import NotificationAddToCart from '@/components/NotificationAddToCart.vue'
import ButtonAdd from '@/components/ButtonAdd.vue'
import { doc, updateDoc, deleteDoc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { useUIStore } from '../stores/uiStore'

const productStore = useProductsStore()
const cartStore = useCartStore()
const router = useRouter()
const ui = useUIStore()
const isDark = computed(() => ui.darkMode)
const visibleCount = ref(10)

const searchQuery = ref('')

// Filtrăm produsele după searchQuery (case insensitive)
const filteredProducts = computed(() => {
  let products = productStore.products.filter(p => !p.expo) // <-- exclude expo
  if (selectedCategory.value !== 'all') {
    products = products.filter(
      p => (p.category || '').toLowerCase() === selectedCategory.value
    )
  }
  if (!searchQuery.value.trim()) return products
  const query = searchQuery.value.toLowerCase()
  return products.filter(p => p.name.toLowerCase().includes(query))
})

// Aplicăm limitarea după filtrare
const visibleProducts = computed(() => {
  return filteredProducts.value.slice(0, visibleCount.value)
})

const allProductsShown = computed(() => {
  return visibleCount.value >= filteredProducts.value.length
})

function loadMore() {
  visibleCount.value += 10
}

function sortProducts(key) {
  if (key === 'price') {
    productStore.products.sort((a, b) => parseFloat(a.price) - parseFloat(b.price))
  } else if (key === 'name') {
    productStore.products.sort((a, b) => a.name.localeCompare(b.name))
  }
  // Resetăm numărul vizibil la 10 când sortăm
  visibleCount.value = 10
}

const showCartNotification = ref(false)
const lastAddedProduct = ref(null)

function handleBuyProduct(product) {
  cartStore.addProductToCart(product)
  lastAddedProduct.value = product
  showCartNotification.value = true
}

function goToCart() {
  router.push({ name: 'cart' })
}

async function handleDeleteProduct(productId) {
  const confirmExpo = await new Promise(resolve => {
    const resp = window.confirm('Vrei să muți produsul în expoziție? Apasă OK pentru expoziție, Cancel pentru ștergere definitvă.')
    resolve(resp)
  })
  if (confirmExpo) {
    await updateDoc(doc(db, 'products', productId), { expo: true })
  } else {
    await deleteDoc(doc(db, 'products', productId))
  }
}

function handleEditProduct(productId) {
  router.push({ name: 'update-product', params: { id: productId } })
}

onMounted(() => {
  productStore.fetchProducts()
  listenTopProductsCurrentMonth()
})

watch(searchQuery, () => {
  visibleCount.value = 10
})

const categories = [
  { key: 'all', label: 'Toate', icon: '🛒' },
  { key: 'decor', label: 'Decorațiuni', icon: '🏺' },
  { key: 'bijuterii', label: 'Bijuterii', icon: '💍' },
  { key: 'haine', label: 'Haine', icon: '👗' },
  { key: 'papetarie', label: 'Papetărie', icon: '📒' },
  { key: 'jucarii', label: 'Jucării', icon: '🧸' },
  { key: 'cadouri', label: 'Cadouri', icon: '🎁' },
  { key: 'arome', label: 'Arome & Lumânări', icon: '🕯️' },
  { key: 'tablouri', label: 'Tablouri & Artă', icon: '🖼️' },
  { key: 'cosmetice', label: 'Cosmetice naturale', icon: '🧴' },
  { key: 'ceramica', label: 'Ceramică', icon: '🍶' },
  { key: 'accesorii', label: 'Accesorii', icon: '👜' },
  { key: 'eco', label: 'Eco & Zero Waste', icon: '🌱' },
  { key: 'hartie', label: 'Obiecte din hârtie', icon: '📄' },
  { key: 'origami', label: 'Origami', icon: '🦢' },
  { key: 'quilling', label: 'Quilling', icon: '🌀' },
  { key: 'crosetate', label: 'Obiecte croșetate', icon: '🧶' },
  { key: 'tricotate', label: 'Obiecte tricotate', icon: '🧵' },
  { key: 'lemn', label: 'Obiecte din lemn', icon: '🪵' },
  { key: 'pictura', label: 'Pictură', icon: '🎨' },
  { key: 'sticla', label: 'Obiecte din sticlă', icon: '🧪' },
  { key: 'fimo', label: 'Fimo & modelaj', icon: '🧱' },
  { key: 'piele', label: 'Obiecte din piele', icon: '👝' },
  { key: 'flori', label: 'Flori & aranjamente', icon: '💐' },
  { key: 'mancare', label: 'Mâncare artizanală', icon: '🍪' },
  { key: 'perisabile', label: 'Mâncare perisabilă', icon: '🥧' },
  { key: 'sapunuri', label: 'Săpunuri & cosmetice', icon: '🧼' },
  { key: 'macrame', label: 'Macrame', icon: '🪢' },
  { key: 'altele', label: 'Altele', icon: '✨' }
]
const selectedCategory = ref('all')
const showCategoryPopup = ref(false)
const showSortDropdown = ref(false)
const showCategoryDropdown = ref(false)

const currentMonth = new Date().toLocaleString('ro-RO', { month: 'long' })

const selectedCategoryLabel = computed(() => {
  if (selectedCategory.value === 'all') return 'Categorii'
  const found = categories.find(c => c.key === selectedCategory.value)
  return found ? found.label : 'Categorii'
})

function selectCategory(key) {
  selectedCategory.value = key
  showCategoryPopup.value = false
  visibleCount.value = 10
}

const topProducts = ref([])


function listenTopProductsCurrentMonth() {
  const now = new Date()
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const lastDayThisMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)

  const q = query(
    collection(db, 'products'),
    where('createdAt', '>=', firstDayThisMonth),
    where('createdAt', '<=', lastDayThisMonth)
  )

  // Ascultă în timp real modificările
  onSnapshot(q, (snapshot) => {
    const products = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    products.sort((a, b) => (b.likedBy?.length || 0) - (a.likedBy?.length || 0))
    topProducts.value = products.slice(0, 10)
  })
}

onMounted(listenTopProductsCurrentMonth)

// --- LIKE HANDLER ---
const auth = getAuth()
const user = ref(null)
onAuthStateChanged(auth, (u) => {
  user.value = u
})

async function handleLike(productId, shouldLike) {
  if (!user.value) {
    alert('Trebuie să fii logat ca să poți adăuga la favorite!')
    return
  }
  const prodRef = doc(db, 'products', productId)
  if (shouldLike) {
    await updateDoc(prodRef, { likedBy: arrayUnion(user.value.uid) })
    // Update local state for instant feedback
    const prod = productStore.products.find(p => p.id === productId)
    if (prod && (!prod.likedBy || !prod.likedBy.includes(user.value.uid))) {
      if (!prod.likedBy) prod.likedBy = []
      prod.likedBy.push(user.value.uid)
    }
  } else {
    await updateDoc(prodRef, { likedBy: arrayRemove(user.value.uid) })
    const prod = productStore.products.find(p => p.id === productId)
    if (prod && prod.likedBy) {
      prod.likedBy = prod.likedBy.filter(uid => uid !== user.value.uid)
    }
  }
}
</script>
