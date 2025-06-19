<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '../stores/productsStore'
import CraftyCard from '../components/CraftyCard.vue'

// Categorii extinse pentru artizanat și handmade
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
const productStore = useProductsStore()

onMounted(async () => {
  await productStore.fetchProducts()
})

const filteredProducts = computed(() => {
  if (selectedCategory.value === 'all') return productStore.products
  return productStore.products.filter(
    p => (p.category || '').toLowerCase() === selectedCategory.value
  )
})
</script>

<template>
  <div class="max-w-6xl mx-auto py-8">
    <h2 class="text-3xl font-bold text-[#7f5539] mb-6 text-center">Categorii produse</h2>
    <div class="flex flex-wrap justify-center gap-4 mb-8">
      <button
        v-for="cat in categories"
        :key="cat.key"
        @click="selectedCategory = cat.key"
        :class=" [
          'flex flex-col items-center px-6 py-4 rounded-xl shadow-md transition',
          selectedCategory === cat.key
            ? 'bg-[#d4a373] text-white scale-105'
            : 'bg-[#faedcd] text-[#7f5539] hover:bg-[#d4a373] hover:text-white'
        ]"
        style="min-width: 120px;"
      >
        <span class="text-3xl mb-2">{{ cat.icon }}</span>
        <span class="font-semibold">{{ cat.label }}</span>
      </button>
    </div>

    <div v-if="filteredProducts.length" class="flex flex-wrap justify-center gap-6">
      <CraftyCard
        v-for="product in filteredProducts"
        :key="product.id"
        :product="product"
      />
    </div>
    <div v-else class="text-center text-xl text-[#7f5539] mt-10">
      Nu există produse în această categorie.
    </div>
  </div>
</template>

<style scoped>
button[disabled] {
  opacity: 0.5;
  pointer-events: none;
}
</style>
