<template>
  <div class="flex flex-col justify-center items-center p-6">
    <h1
      class="mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl lg:text-6xl text-[#d4a373]"
    >
      Modifică Produsul
    </h1>

    <form @submit.prevent="updateProduct" class="w-full max-w-lg bg-white p-6 rounded-md shadow-md">
      <div class="mb-4">
        <label for="name" class="block text-gray-700 font-bold mb-2">Numele Produsului</label>
        <input
          v-model="product.name"
          type="text"
          id="name"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          required
        />
      </div>
      <div class="mb-4">
        <label for="price" class="block text-gray-700 font-bold mb-2">Preț</label>
        <input
          v-model="product.price"
          type="number"
          step="0.01"
          id="price"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          required
        />
      </div>
     
      <div class="mb-4">
        <label for="stock" class="block text-gray-700 font-bold mb-2">Stoc</label>
        <input
          v-model="product.stock"
          type="number"
          id="stock"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          required
        />
      </div>
      <div class="mb-4">
        <label for="category" class="block text-gray-700 font-bold mb-2">Categorie</label>
        <select
          v-model="product.category"
          id="category"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          required
        >
          <option v-for="cat in categories" :key="cat.key" :value="cat.key">
            {{ cat.label }}
          </option>
        </select>
      </div>
      <div class="mb-4">
        <label for="images" class="block text-gray-700 font-bold mb-2">Imaginile Produsului</label>
        <div class="flex flex-col items-start">
          <input
            @change="handleImageChange"
            type="file"
            id="images"
            multiple
            accept="image/*"
            class="hidden"
          />
          <label
            for="images"
            class="inline-block cursor-pointer px-4 py-2 bg-[#faedcd] text-[#7f5539] font-semibold rounded-full shadow border-2 border-[#d4a373] hover:bg-[#d4a373] hover:text-white transition-all duration-200 text-sm"
          >
            Adaugă imagini
          </label>
          <span class="text-xs text-gray-400 mt-1">Maxim 5 imagini, .jpg/.jpeg/.png, max 5MB fiecare</span>
        </div>
      </div>
      <div class="mb-4" v-if="imagePreviews.length">
        <label class="block text-gray-700 font-bold mb-2">Previzualizare</label>
        <div class="flex flex-wrap -m-1">
          <div
            v-for="(image, index) in imagePreviews"
            :key="index"
            class="w-1/3 p-1"
          >
            <img
              :src="image"
              alt="Image preview"
              class="w-full h-auto rounded-lg"
            />
          </div>
        </div>
      </div>
      <div class="mb-4">
        <label for="description" class="block text-gray-700 font-bold mb-2">Descriere</label>
        <textarea
          v-model="product.description"
          id="description"
          rows="4"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          required
        ></textarea>
      </div>
      <div class="mb-4">
        <label for="tutorial" class="block text-gray-700 font-bold mb-2">Link Tutorial</label>
        <input
          v-model="product.tutorial"
          type="text"
          id="tutorial"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        />
      </div>
      <div class="mb-4">
        <label for="location" class="block text-gray-700 font-bold mb-2">Locație</label>
        <div class="flex flex-col items-start gap-2">
          <LocationSelect
            v-model:judet="selectedJudet"
            v-model:localitate="selectedLocalitate"
            class="w-full"
          />
        </div>
      </div>
      <div class="flex justify-center">
        <button
          type="submit"
          class="mx-auto mt-5 mb-5 block text-3xl text-[#7f5539] hover:bg-[#d4a373] hover:text-[#faedcd] rounded p-2 font-bold"
        >
          MODIFICĂ
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import axios from 'axios'
import LocationSelect from '@/components/LocationSelect.vue'


const route = useRoute()
const router = useRouter()
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
  { key: 'hartie', label: 'Obiecte din hârtie' },
  { key: 'origami', label: 'Origami' },
  { key: 'quilling', label: 'Quilling' },
  { key: 'crosetate', label: 'Obiecte croșetate' },
  { key: 'tricotate', label: 'Obiecte tricotate' },
  { key: 'lemn', label: 'Obiecte din lemn' },
  { key: 'pictura', label: 'Pictură' },
  { key: 'sticla', label: 'Obiecte din sticlă' },
  { key: 'fimo', label: 'Fimo & modelaj' },
  { key: 'piele', label: 'Obiecte din piele' },
  { key: 'flori', label: 'Flori & aranjamente' },
  { key: 'mancare', label: 'Mâncare artizanală' },
  { key: 'perisabile', label: 'Mâncare perisabilă' },
  { key: 'sapunuri', label: 'Săpunuri & cosmetice' },
  { key: 'macrame', label: 'Macrame' },
  { key: 'altele', label: 'Altele' }
]

const product = ref({
  name: '',
  price: '',
  stock: 0,
  category: categories[0].key,
  description: '',
  tutorial: '',
  location: '',
  images: []
})
const selectedImages = ref([])
const imagePreviews = ref([])

const selectedJudet = ref('')
const selectedLocalitate = ref('')



const fetchProduct = async () => {
  try {
    const docRef = doc(db, 'products', route.params.id)
    const docSnap = await getDoc(docRef)
    if (docSnap.exists()) {
      const data = docSnap.data()
      product.value = { ...product.value, ...data, id: route.params.id }
      // Setează județul și localitatea dacă există
      if (data.location) {
        const [judet, localitate] = data.location.split(',').map(s => s.trim())
        selectedJudet.value = judet
        selectedLocalitate.value = localitate
      }
      imagePreviews.value = data.images || []
    }
  } catch (error) {
    console.error('Failed to fetch product:', error)
  }
}

function handleImageChange(e) {
  const files = Array.from(e.target.files)
  if (files.length > 5) {
    alert('Poți adăuga maxim 5 imagini.')
    return
  }
  for (const file of files) {
    if (!['image/jpeg', 'image/png', 'image/jpg'].includes(file.type)) {
      alert('Doar imagini .jpg, .jpeg, .png sunt permise.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      alert('Fiecare imagine trebuie să fie sub 5MB.')
      return
    }
  }
  selectedImages.value = files
  imagePreviews.value = files.map(file => URL.createObjectURL(file))
}

const CLOUD_NAME = 'dsexoi1zt'
const UPLOAD_PRESET = 'CraftyRo'

async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  const response = await axios.post(url, formData)
  return response.data.secure_url
}

const updateProduct = async () => {
  try {
    if (product.value.description.length < 50) {
      alert('Descrierea trebuie să aibă minim 50 de caractere.')
      return
    }
    let imageLinks = product.value.images || []
    if (selectedImages.value.length > 0) {
      imageLinks = []
      for (const file of selectedImages.value) {
        const link = await uploadImageToCloudinary(file)
        imageLinks.push(link)
      }
    }
    await updateDoc(doc(db, 'products', product.value.id), {
      name: product.value.name,
      price: parseFloat(product.value.price),
      stock: parseInt(product.value.stock),
      category: product.value.category,
      description: product.value.description,
      tutorial: product.value.tutorial,
      location: selectedJudet.value + ', ' + selectedLocalitate.value,
      images: imageLinks
    })
    alert('Produs actualizat cu succes!')
    router.push({ name: 'shop' })
  } catch (error) {
    console.error('Failed to update product:', error)
    alert('Eroare la actualizarea produsului.')
  }
}

onMounted(fetchProduct)
</script>


<style></style>
