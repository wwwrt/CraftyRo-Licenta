<template>
  <div class="max-w-3xl mx-auto py-8">
    <h2 class="text-2xl font-bold mb-6 text-center">Comenzile tale</h2>
    <div v-if="loading" class="flex justify-center items-center py-12">
      <span class="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-[#f55f09]"></span>
    </div>
    <div v-else>
      <div v-if="orders.length > 0" class="space-y-6">
        <div
          v-for="product in orders"
          :key="product.docId"
          class="cart-card flex items-center bg-white rounded-2xl shadow-lg p-4 group relative"
        >
          <img :src="product.imageURL || product.image" alt="Imagine produs" class="w-24 h-24 rounded-xl object-cover border-2 border-[#faedcd] shadow mr-4" />
          <div class="flex-1 ml-6 flex flex-col justify-between h-full">
            <div>
              <h2 class="text-xl font-semibold text-[#7f5539] mb-1">{{ product.name }}</h2>
              <p class="text-[#b5838d] mb-2">
                Preț: <span class="font-bold text-[#d4a373]">{{ product.price }} lei</span>
              </p>
              <div v-if="!product.status || product.status === 'in_cart'">
                <button
                  @click="buyNow(product)"
                  class="mb-2 px-6 py-2 bg-[#f55f09] hover:bg-[#7f5539] text-white font-bold rounded-lg shadow transition-all duration-200 ease-in-out text-base"
                >Cumpără acum</button>
              </div>
              <div v-else-if="product.status === 'pending'">
                <span class="text-yellow-600 font-bold">Așteaptă răspunsul vânzătorului...</span>
              </div>
              <div v-else-if="product.status === 'awb_sent'">
                <span class="text-green-600 font-bold">Vânzătorul a acceptat comanda, vezi AWB.</span>
                <button
                  class="ml-2 px-3 py-1 bg-[#d4a373] text-white rounded"
                  @click="showAwb(product.awb)"
                >Vezi AWB</button>
                <div v-if="!product.finalizationAsked" class="mt-2">
                  <button
                    class="px-4 py-1 bg-[#d4a373] text-white rounded"
                    @click="askFinalize(product)"
                  >Ai finalizat comanda cu succes?</button>
                </div>
                <div v-else-if="product.finalizationAsked && !product.finalizationResponse" class="mt-2 flex gap-2">
                  <span>Ai finalizat comanda cu succes?</span>
                  <button class="px-3 py-1 bg-green-500 text-white rounded" @click="finalizeOrder(product, true)">Da</button>
                  <button class="px-3 py-1 bg-red-500 text-white rounded" @click="finalizeOrder(product, false)">Nu</button>
                </div>
                <div v-else-if="product.finalizationResponse === true" class="mt-2 text-green-700 font-bold">
                  Comanda a fost finalizată cu succes!
                </div>
                <div v-else-if="product.finalizationResponse === false" class="mt-2">
                  <span>Vrei să reiei procesul?</span>
                  <button class="px-3 py-1 bg-green-500 text-white rounded" @click="retryOrder(product)">Da</button>
                  <button class="px-3 py-1 bg-gray-400 text-white rounded" @click="removeOrder(product)">Nu</button>
                </div>
              </div>
              <div v-else-if="product.status === 'failed'" class="mt-2">
                <span>Comanda nu a fost finalizată cu succes.</span>
                <span class="block mt-1">Vrei să reiei procesul?</span>
                <button class="px-3 py-1 bg-green-500 text-white rounded mt-1" @click="retryOrder(product)">Da</button>
                <button class="px-3 py-1 bg-gray-400 text-white rounded mt-1" @click="removeOrder(product)">Nu</button>
              </div>
            </div>
          </div>
          <button
            v-if="!product.status || product.status === 'in_cart'"
            @click.stop="removeFromCart(product)"
            class="absolute top-2 right-2 text-[#f55f09] hover:text-[#7f5539] text-2xl font-bold p-0 bg-transparent border-none shadow-none focus:outline-none transition-colors"
            title="Șterge din coș"
            aria-label="Șterge din coș"
          >
            ×
          </button>
        </div>
      </div>
      <div v-else class="text-center text-[#b5838d]">Nu ai produse în coș.</div>
      <!-- Popup AWB -->
      <div v-if="awbPopup" class="fixed inset-0 flex items-center justify-center bg-black/40 z-50">
        <div class="bg-white rounded-xl p-6 shadow-lg text-center">
          <h3 class="text-xl font-bold mb-2">AWB livrare</h3>
          <div class="text-2xl font-mono mb-4">{{ awbPopup }}</div>
          <button class="px-4 py-2 bg-[#d4a373] text-white rounded" @click="awbPopup = null">Închide</button>
        </div>
      </div>
      <h2 class="text-xl font-bold mt-12 mb-4">Istoric comenzi finalizate</h2>
      <div v-if="completedOrders.length > 0">
        <div
          v-for="order in completedOrders"
          :key="order.docId"
          class="bg-green-50 border border-green-300 rounded-xl p-4 mb-4"
        >
          <div class="font-bold">{{ order.name }}</div>
          <div>{{ order.price }} lei</div>
          <div>Status: Finalizată</div>
        </div>
      </div>
      <div v-else class="text-[#b5838d]">Nu ai comenzi finalizate.</div>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { db } from '@/firebaseconfig'
import { collection, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore'
import { useRouter } from 'vue-router'
import { useCartStore } from '@/stores/cartStore'
const router = useRouter()
const cartStore = useCartStore()

const awbPopup = ref(null)
const orders = ref([])
const completedOrders = ref([])
const loading = ref(true)
let user = null

onMounted(() => {
  const auth = getAuth()
  onAuthStateChanged(auth, (u) => {
    user = u
    if (!user) {
      orders.value = []
      completedOrders.value = []
      return
    }
    const q = collection(db, 'users', user.uid, 'cart')
    onSnapshot(q, snap => {
      const all = snap.docs.map(docu => ({
        docId: docu.id,
        ...docu.data()
      }))
      orders.value = all.filter(order =>
        order.status !== 'completed' &&
        order.status !== 'removed'
      )
      completedOrders.value = all.filter(order => order.status === 'completed')
      loading.value = false
    })
  })
})

function buyNow(product) {
  localStorage.setItem('selectedOrderProducts', JSON.stringify([{
    docId: product.docId,
    productId: product.productId || product.id,
    name: product.name,
    price: product.price,
    imageURL: product.imageURL || product.image,
    sellerId: product.sellerId || product.userId
  }]))
  // Redirecționează către OrderForm
  router.push({ name: 'order-form' })
}

function showAwb(awb) {
  awbPopup.value = awb
}

async function askFinalize(product) {
  await updateDoc(doc(db, 'users', user.uid, 'cart', product.docId), {
    finalizationAsked: true
  })
  product.finalizationAsked = true
}

async function finalizeOrder(product, success) {
  await updateDoc(doc(db, 'users', user.uid, 'cart', product.docId), {
    finalizationResponse: success,
    status: success ? 'completed' : 'failed'
  })
  product.finalizationResponse = success
  product.status = success ? 'completed' : 'failed'
}

async function retryOrder(product) {
  await updateDoc(doc(db, 'users', user.uid, 'cart', product.docId), {
    status: 'in_cart',
    finalizationAsked: false,
    finalizationResponse: null,
    buyerName: null,
    address: null,
    phone: null,
    awb: null
  })
  product.status = 'in_cart'
  product.finalizationAsked = false
  product.finalizationResponse = null
  product.buyerName = null
  product.address = null
  product.phone = null
  product.awb = null
}

async function removeOrder(product) {
  await deleteDoc(doc(db, 'users', user.uid, 'cart', product.docId))
}

function removeFromCart(product) {
  cartStore.removeProductFromCart(product.docId)
}
</script>
