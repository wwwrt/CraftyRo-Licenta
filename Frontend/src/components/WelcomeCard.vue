import { RouterLink } from 'vue-router';
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { auth, db } from '../firebaseconfig'
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import axios from 'axios'

const CLOUD_NAME = 'dsexoi1zt'
const UPLOAD_PRESET = 'CraftyRo'

const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const displayName = ref('')
const error = ref('')
const loading = ref(false)
const router = useRouter()

const imageFile = ref(null)
const imagePreview = ref('')

function handleImageChange(e) {
  const file = e.target.files[0]
  if (file) {
    imageFile.value = file
    imagePreview.value = URL.createObjectURL(file)
  }
}

async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  const response = await axios.post(url, formData)
  return response.data.secure_url
}

const handleSignup = async () => {
  error.value = ''
  if (password.value.length < 6) {
    error.value = 'Parola trebuie să aibă cel puțin 6 caractere.'
    return
  }
  if (password.value !== confirmPassword.value) {
    error.value = 'Parolele nu coincid.'
    return
  }
  loading.value = true
  try {
    let photoURL = ''
    if (imageFile.value) {
      photoURL = await uploadImageToCloudinary(imageFile.value)
    }
    const result = await createUserWithEmailAndPassword(auth, email.value, password.value)
    // Actualizează profilul Firebase Auth
    await updateProfile(result.user, {
      displayName: displayName.value,
      photoURL: photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName.value || email.value)}&background=eee&color=bbb&size=120`
    })
    // Salvează userul și în Firestore
    await setDoc(doc(db, 'users', result.user.uid), {
      uid: result.user.uid,
      email: result.user.email,
      displayName: displayName.value,
      photoURL: photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName.value || email.value)}&background=eee&color=bbb&size=120`,
      createdAt: new Date()
    })
    router.push('/')
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      error.value = 'Acest email este deja folosit.'
    } else {
      error.value = 'Eroare la crearea contului: ' + e.message
    }
  }
  loading.value = false
}

onMounted(() => {
  email.value = ''
  password.value = ''
  confirmPassword.value = ''
  displayName.value = ''
  imageFile.value = null
  imagePreview.value = ''
})
</script>
<template>
  <div>
    <div class="w-full lg:max-w-xl p-6 space-y-8 sm:p-8 rounded-lg shadow-xl bg-[#d4a373]">
      <h2 class="text-2xl font-bold text-[#fefae0]">Creează cont pe CraftyRO</h2>
      <form class="mt-8 space-y-6" @submit.prevent="handleSignup">
        <div>
          <label for="displayName" class="block mb-2 text-sm font-medium">Nume</label>
          <input
            v-model="displayName"
            type="text"
            id="displayName"
            class="bg-[#fefae0] border border-[#fefae0] text-[#d4a373] text-sm rounded-lg w-full p-2.5"
            placeholder="Numele tău"
          />
        </div>
        <div>
          <label class="block mb-2 text-sm font-medium">Imagine de profil</label>
          <div class="flex items-center gap-4">
            <label
              class="cursor-pointer px-4 py-2 bg-[#e7c8a0] text-[#484564] rounded-lg font-medium hover:bg-[#484564] hover:text-white transition"
            >
              Alege imagine
              <input
                type="file"
                accept="image/*"
                @change="handleImageChange"
                class="hidden"
              />
            </label>
            <div v-if="imagePreview" class="mt-2">
              <img :src="imagePreview" class="w-20 h-20 object-cover rounded-full border" />
            </div>
          </div>
        </div>
        <div>
          <label for="email" class="block mb-2 text-sm font-medium">Email</label>
          <input
            v-model="email"
            autocomplete="off"
            type="email"
            id="email"
            class="bg-[#fefae0] border border-[#fefae0] text-[#d4a373] text-sm rounded-lg w-full p-2.5"
            placeholder="nume@email.com"
            required
          />
        </div>
        <div>
          <label for="password" class="block mb-2 text-sm font-medium">Parolă</label>
          <input
            v-model="password"
            autocomplete="off"
            type="password"
            id="password"
            placeholder="••••••••"
            class="bg-[#fefae0] border border-[#fefae0] text-[#d4a373] text-sm rounded-lg block w-full p-2.5"
            required
          />
        </div>
        <div>
          <label for="confirmPassword" class="block mb-2 text-sm font-medium">Repetă parola</label>
          <input
            v-model="confirmPassword"
            type="password"
            id="confirmPassword"
            placeholder="••••••••"
            class="bg-[#fefae0] border border-[#fefae0] text-[#d4a373] text-sm rounded-lg block w-full p-2.5"
            required
          />
        </div>
        <div v-if="error" class="text-red-600 text-sm text-center">{{ error }}</div>
        <div class="flex flex-col items-center">
          <button
            type="submit"
            :disabled="loading"
            class="w-full px-5 py-3 text-base font-medium text-center text-white bg-[#e7c8a0] rounded-lg hover:bg-[#484564] sm:w-auto"
          >
            Creează cont
          </button>
          <div class="mt-6 text-sm font-medium text-gray-900 dark:text-white">
            Ai deja cont?
            <RouterLink
              class="text-blue-600 hover:underline dark:text-[#484564]"
              :to="{ name: 'login' }"
              >Autentifică-te</RouterLink
            >
          </div>
        </div>
      </form>
      <div class="flex flex-col items-center gap-4 mt-6">
        <div v-if="!showReset" class="flex flex-row items-center justify-center gap-6 mt-4">
          <button
            @click="loginWithGoogle"
            class="w-14 h-14 flex items-center justify-center rounded-full bg-white border border-[#e7c8a0] hover:bg-[#fefae0] transition"
            aria-label="Autentificare cu Google"
            type="button"
          >
            <img src="/Glogo.png" alt="Google" class="w-8 h-8 object-contain" />
          </button>
          <button
            @click="loginWithFacebook"
            class="w-14 h-14 flex items-center justify-center rounded-full bg-white border border-[#e7c8a0] hover:bg-[#fefae0] transition"
            aria-label="Autentificare cu Facebook"
            type="button"
          >
            <img src="/Flogo.png" alt="Facebook" class="w-14 h-14 object-contain" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
