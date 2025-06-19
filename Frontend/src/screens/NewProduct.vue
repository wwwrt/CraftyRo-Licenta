<template>
  <div class="flex flex-col justify-center items-center p-6">
    <h1
      class="mb-4 text-4xl font-extrabold tracking-tight leading-none md:text-5xl lg:text-6xl text-[#d4a373]"
    >
      Adaugă un nou Produs
    </h1>

    <form @submit.prevent="addProduct" class="w-full max-w-lg bg-white p-6 rounded-md shadow-md">
      <div class="mb-4">
        <label for="name" class="block text-gray-700 font-bold mb-2">Numele Produsului</label>
        <input
          v-model="newProduct.name"
          type="text"
          id="name"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          required
        />
      </div>
      <div class="mb-4">
        <label for="price" class="block text-gray-700 font-bold mb-2">Preț</label>
        <input
          v-model="newProduct.price"
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
          v-model="newProduct.stock"
          type="number"
          id="stock"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          required
        />
      </div>
      <div class="mb-4">
        <label for="category" class="block text-gray-700 font-bold mb-2">Categorie</label>
        <select
          v-model="newProduct.category"
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
        <label for="description" class="block text-gray-700 font-bold mb-2">Descriere</label>
        <textarea
          v-model="newProduct.description"
          id="description"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          minlength="50"
          required
          rows="3"
          placeholder="Descrie produsul (minim 50 caractere)"
        ></textarea>
        <div class="text-xs text-gray-500 mt-1">
          {{ newProduct.description.length }}/50 caractere
        </div>
      </div>
      <div class="mb-4">
        <!-- <div class="flex items-center mb-2">
          <label for="judet" class="block text-gray-700 font-bold mr-2">Județ</label>
          <button
            type="button"
            @click="detectLocation"
            class="ml-2 p-1 rounded-full hover:bg-[#faedcd] focus:outline-none focus:ring-2 focus:ring-[#d4a373] transition"
            title="Detectează automat locația"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#d4a373" class="w-6 h-6">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
              <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
            </svg>
          </button>
        </div> -->
        <LocationSelect
          v-model:judet="selectedJudet"
          v-model:localitate="selectedLocalitate"
        />
      </div>
      <div class="mb-4">
        <label for="images" class="block text-gray-700 font-bold mb-2">Imaginile produsului (max 5)</label>
        <div class="flex flex-col items-start">
          <input
            type="file"
            accept="image/jpeg,image/png,image/jpg"
            multiple
            id="images"
            @change="handleImageChange"
            class="hidden"
          />
          <label
            for="images"
            class="inline-block cursor-pointer px-4 py-2 bg-[#faedcd] text-[#7f5539] font-semibold rounded-full shadow border-2 border-[#d4a373] hover:bg-[#d4a373] hover:text-white transition-all duration-200 text-sm"
          >
            Adaugă imagini
          </label>
          <span class="text-xs text-gray-400 mt-1">Maxim 5 imagini, .jpg/.jpeg/.png, max 5MB fiecare</span>
          <div class="flex gap-2 mt-2 flex-wrap">
            <img v-for="(src, idx) in imagePreviews" :key="idx" :src="src" class="w-20 h-20 object-cover rounded-lg border" />
          </div>
        </div>
      </div>
      <div class="mb-4">
        <label for="tutorial" class="block text-gray-700 font-bold mb-2">Link tutorial YouTube (opțional)</label>
        <input
          v-model="newProduct.tutorial"
          type="url"
          id="tutorial"
          class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
          placeholder="https://youtube.com/..."
        />
      </div>
      <div class="flex justify-center">
        <button
          type="submit"
          class="mx-auto mt-5 mb-5 block text-3xl text-[#7f5539] hover:bg-[#d4a373] hover:text-[#faedcd] rounded p-2 font-bold"
        >
          Adaugă
        </button>
      </div>
    </form>
  </div>
</template>

<script setup>
import LocationSelect from '@/components/LocationSelect.vue'
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { collection, addDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import { getAuth } from 'firebase/auth'
import axios from 'axios'

const router = useRouter()

// Cloudinary config
const CLOUD_NAME = 'dsexoi1zt'
const UPLOAD_PRESET = 'CraftyRo'

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

const judete = [
  { name: 'Alba', localitati: ['Alba Iulia', 'Aiud', 'Blaj'] },
  { name: 'Arad', localitati: ['Arad', 'Ineu', 'Lipova'] },
  // ... toate județele și localitățile
]

const newProduct = ref({
  name: '',
  price: '',
  stock: 0,
  category: categories[0].key,
  description: '',
  tutorial: ''
})

const selectedJudet = ref(judete[0].name)
const selectedLocalitate = ref(judete[0].localitati[0])

// Pentru imagini
const selectedImages = ref([])
const imagePreviews = ref([])

function handleImageChange(e) {
  const files = Array.from(e.target.files)
  if (files.length > 5) {
    alert('Poți adăuga maxim 5 imagini.')
    return
  }
  // Validare tip și mărime
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

// Upload o imagine pe Cloudinary
async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  const response = await axios.post(url, formData)
  return response.data.secure_url
}

const addProduct = async () => {
  try {
    const auth = getAuth()
    const user = auth.currentUser
    if (!user) {
      alert('Trebuie să fii autentificat pentru a adăuga un produs.')
      return
    }
    if (newProduct.value.description.length < 50) {
      alert('Descrierea trebuie să aibă minim 50 de caractere.')
      return
    }
    if (selectedImages.value.length === 0) {
      alert('Adaugă cel puțin o imagine.')
      return
    }

    // Încarcă imaginile pe Cloudinary
    const imageLinks = []
    for (const file of selectedImages.value) {
      const link = await uploadImageToCloudinary(file)
      imageLinks.push(link)
    }

    await addDoc(collection(db, 'products'), {
      name: newProduct.value.name,
      price: parseFloat(newProduct.value.price),
      stock: parseInt(newProduct.value.stock),
      category: newProduct.value.category,
      description: newProduct.value.description,
      location: selectedJudet.value + ', ' + selectedLocalitate.value,
      userId: user.uid,
      images: imageLinks, // array cu linkuri Cloudinary
      tutorial: newProduct.value.tutorial, // link YouTube
      createdAt: serverTimestamp()
    })

    alert('Produs adăugat cu succes!')
    router.push({ name: 'shop' })

    // Resetare formular
    newProduct.value = {
      name: '',
      price: '',
      stock: 0,
      category: categories[0].key,
      description: '',
      tutorial: ''
    }
    selectedImages.value = []
    imagePreviews.value = []
  } catch (error) {
    console.error('Failed to add product:', error)
    alert('Eroare la adăugarea produsului în Firebase.')
  }
}
</script>

<style></style>
