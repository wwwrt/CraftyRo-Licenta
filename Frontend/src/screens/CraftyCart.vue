<template>
  <div class="cart-container">
    <h1 class="text-3xl font-bold mb-8">Coșul tău</h1>
    <div v-if="cartProducts.length > 0" class="space-y-6">
      <div
        v-for="product in cartProducts"
        :key="product.docId"
        class="cart-card flex items-center bg-white rounded-2xl shadow-lg p-4 hover:shadow-2xl transition group relative"
        :class="{ 'opacity-40': product.selected === false }"
      >
        <!-- Checkbox pentru selectare produs -->
        <input
          type="checkbox"
          class="form-checkbox w-6 h-6 accent-[#d4a373] mr-4"
          v-model="product.selected"
        />
        <img
          :src="product.image"
          alt="Product Image"
          class="cart-product-image w-24 h-24 rounded-xl object-cover border-2 border-[#faedcd] shadow group-hover:scale-105 transition"
          @click="goToProduct(product.productId)"
          style="cursor:pointer;"
        />
        <div class="cart-product-details flex-1 ml-6 flex flex-col justify-between h-full">
          <div>
            <h2
              @click="goToProduct(product.productId)"
              class="text-xl font-semibold text-[#7f5539] mb-1 cursor-pointer group-hover:underline"
            >
              {{ product.name }}
            </h2>
            <p class="text-[#b5838d] mb-2">
              Preț: <span class="font-bold text-[#d4a373]">{{ product.price }} lei</span>
            </p>
            <div class="flex items-center gap-2 mb-2">
              <button
                @click="updateQuantity(product.docId, product.quantity - 1)"
                class="w-8 h-8 flex items-center justify-center rounded-full bg-[#faedcd] text-[#7f5539] font-bold text-lg hover:bg-[#d4a373] hover:text-white transition"
                :disabled="product.quantity <= 1"
              >-</button>
              <span class="font-bold text-lg px-2">{{ product.quantity }}</span>
              <button
                @click="updateQuantity(product.docId, product.quantity + 1)"
                class="w-8 h-8 flex items-center justify-center rounded-full bg-[#faedcd] text-[#7f5539] font-bold text-lg hover:bg-[#d4a373] hover:text-white transition"
              >+</button>
            </div>
          </div>
          <button
            @click="contactSeller(product)"
            class="contact-seller-btn absolute right-4 bottom-2 bg-[#faedcd] text-[#7f5539] px-3 py-1.5 rounded-md font-bold hover:bg-[#d4a373] hover:text-white transition flex items-center gap-2 shadow text-sm"
            title="Trimite mesaj vânzătorului"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.77 9.77 0 0 1-4-.8L3 21l1.8-4A8.96 8.96 0 0 1 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
            </svg>
            Trimite mesaj
          </button>
          <button
            @click="removeProduct(product.docId)"
            class="absolute top-2 right-2 text-[#f55f09] hover:text-red-700 transition"
            title="Șterge produsul"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      </div>
      <div class="text-right font-bold text-2xl mt-8 text-[#7f5539]">
        Total: <span class="text-[#d4a373]">{{ totalPrice }} lei</span>
      </div>
      <div class="flex justify-end mt-6">
        <button
          class="px-8 py-3 bg-[#d4a373] hover:bg-[#7f5539] text-white font-bold rounded-lg shadow transition-all duration-200 ease-in-out text-lg"
          :disabled="selectedProducts.length === 0"
          @click="placeOrder"
        >
          Comandă produsele
        </button>
      </div>
    </div>
    <div v-else>
      <p class="text-lg text-[#b5838d]">Coșul tău este gol.</p>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted, watch } from 'vue'
import { useCartStore } from '@/stores/cartStore'
import { useRouter } from 'vue-router'

const cartStore = useCartStore()
const cartProducts = computed(() => cartStore.products)
const router = useRouter()

// Inițializează selected=true pentru toate produsele la încărcare sau modificare
onMounted(() => {
  cartStore.fetchCartItems().then(() => {
    cartProducts.value.forEach(p => p.selected = true)
  })
})
watch(cartProducts, (products) => {
  products.forEach(p => {
    if (p.selected === undefined) p.selected = true
  })
}, { immediate: true })

function removeProduct(docId) {
  cartStore.removeProductFromCart(docId)
}
function updateQuantity(docId, qty) {
  cartStore.updateQuantity(docId, qty)
}
function goToProduct(productId) {
  router.push({ name: 'product-detail', params: { id: productId } })
}
function contactSeller(product) {
  router.push({ name: 'messages', query: { productId: product.productId || product.id, sellerId: product.sellerId || product.userId } })
}

const selectedProducts = computed(() =>
  cartProducts.value.filter(p => p.selected)
)
const totalPrice = computed(() =>
  selectedProducts.value.reduce((sum, p) => sum + p.price * p.quantity, 0).toFixed(2)
)

function placeOrder() {
  if (selectedProducts.value.length === 0) return
  // Poți salva selectedProducts.value într-un store sau localStorage dacă vrei să le folosești pe pagina următoare
  localStorage.setItem('selectedOrderProducts', JSON.stringify(selectedProducts.value))
  router.push({ name: 'payment-method' })
}
</script>

<style scoped>
.cart-container {
  max-width: 800px;
  margin: auto;
  padding: 32px 20px;
  text-align: center;
}
.cart-card {
  position: relative;
  border: 1px solid #faedcd;
  min-height: 140px;
}
.cart-product-image {
  min-width: 96px;
  min-height: 96px;
  max-width: 96px;
  max-height: 96px;
}
.cart-product-details {
  text-align: left;
  position: relative;
  min-height: 96px;
}
.contact-seller-btn {
  font-size: 0.95rem;
  padding-top: 0.3rem;
  padding-bottom: 0.3rem;
  padding-left: 0.9rem;
  padding-right: 0.9rem;
  border-radius: 0.5rem;
}
</style>
