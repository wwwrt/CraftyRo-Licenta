<script setup>
import { ref, onMounted, computed, onUnmounted } from 'vue'
import { collection, getDocs, addDoc, setDoc, serverTimestamp, query, orderBy, doc, getDoc, where, onSnapshot } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import CarouselShop from '@/components/CarouselShop.vue'
import ImageComponent from '/src/components/HomeImages.vue'
import ButtonAdd from '@/components/ButtonAdd.vue'

const products = ref([])
const testimonials = ref([])
const loadingTestimonials = ref(true)
const newTestimonial = ref({ message: '' })
const submitting = ref(false)
const error = ref('')
const user = ref(null)
const userProfile = ref(null)
const userTestimonialId = ref(null) // ID-ul testimonialului userului curent
const showSuccess = ref(false)
const successMessage = ref('')
const editMode = ref(false)
const defaultAvatar = computed(() =>
  'https://ui-avatars.com/api/?name=' +
  encodeURIComponent(userProfile.value?.displayName || userProfile.value?.email || 'User')
)

onMounted(async () => {
  // Produse
  const querySnapshot = await getDocs(collection(db, 'products'))
  products.value = querySnapshot.docs
    .map(doc => ({ ...doc.data(), id: doc.id }))
    .filter(p => p.id && p.imageURL)

  // User
  const auth = getAuth()
  onAuthStateChanged(auth, async (u) => {
    user.value = u
    if (u) {
      // Citește profilul complet din Firestore
      const userDoc = await getDoc(doc(db, 'users', u.uid))
      userProfile.value = userDoc.exists() ? userDoc.data() : null
      await fetchUserTestimonial()
    } else {
      userProfile.value = null
      userTestimonialId.value = null
      newTestimonial.value.message = ''
    }
  })

  // Testimoniale
  await fetchTestimonials()
})

const fetchTestimonials = async () => {
  loadingTestimonials.value = true
  const q = query(collection(db, 'testimonials'), orderBy('createdAt', 'desc'))
  const querySnapshot = await getDocs(q)
  testimonials.value = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  loadingTestimonials.value = false
}

const fetchUserTestimonial = async () => {
  if (!user.value) return
  const q = query(collection(db, 'testimonials'), where('uid', '==', user.value.uid))
  const querySnapshot = await getDocs(q)
  if (!querySnapshot.empty) {
    const docData = querySnapshot.docs[0]
    userTestimonialId.value = docData.id
    newTestimonial.value.message = docData.data().message
    editMode.value = false
  } else {
    userTestimonialId.value = null
    newTestimonial.value.message = ''
    editMode.value = true
  }
}

const addOrUpdateTestimonial = async () => {
  error.value = ''
  if (!newTestimonial.value.message.trim()) {
    error.value = 'Completează mesajul.'
    return
  }
  if (!user.value || !userProfile.value) {
    error.value = 'Trebuie să fii autentificat.'
    return
  }
  submitting.value = true
  try {
    if (userTestimonialId.value) {
      await setDoc(doc(db, 'testimonials', userTestimonialId.value), {
        name: userProfile.value.displayName || user.value.displayName || 'Anonim',
        photoURL: userProfile.value.photoURL || user.value.photoURL || '',
        uid: user.value.uid,
        message: newTestimonial.value.message.trim(),
        createdAt: serverTimestamp()
      })
      successMessage.value = 'Mulțumim! Modificarea a fost trimisă cu succes.'
    } else {
      const docRef = await addDoc(collection(db, 'testimonials'), {
        name: userProfile.value.displayName || user.value.displayName || 'Anonim',
        photoURL: userProfile.value.photoURL || user.value.photoURL || '',
        uid: user.value.uid,
        message: newTestimonial.value.message.trim(),
        createdAt: serverTimestamp()
      })
      userTestimonialId.value = docRef.id
      successMessage.value = 'Mulțumim! Testimonialul tău a fost trimis cu succes.'
    }
    await fetchTestimonials()
    showSuccess.value = true
    editMode.value = false
    setTimeout(() => { showSuccess.value = false }, 3000)
  } catch (e) {
    error.value = 'Eroare la trimiterea testimonialului.'
  }
  submitting.value = false
}

const currentMonth = new Date().toLocaleString('ro-RO', { month: 'long' })

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

const isDark = ref(document.documentElement.classList.contains('dark'))

function updateDarkMode() {
  isDark.value = document.documentElement.classList.contains('dark')
}

// Ascultă modificările pe clasa 'dark' de pe <html>
const observer = new MutationObserver(updateDarkMode)
onMounted(() => {
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  updateDarkMode()
})
onUnmounted(() => {
  observer.disconnect()
})

const makeItGif = computed(() => isDark.value ? '/MakeItDM.gif' : '/MakeIt.gif')
const buyItGif = computed(() => isDark.value ? '/BuyItDM.gif' : '/BuyIt.gif')
const sellItGif = computed(() => isDark.value ? '/SellItDM.gif' : '/SellIt.gif')
</script>

<template>
  <div class="flex flex-col min-h-screen mt-8">
    <div class="content">
      <!-- GIF-uri + tagline suprapus -->
      <div
        class="relative flex flex-row items-center justify-center gap-2 pt-8 sm:pt-12 md:pt-20 lg:pt-28 xl:pt-28 pb-4 px-4 lg:px-16 xl:px-32 mb-8 sm:mb-12 md:mb-8 lg:mb-16 xl:mb-24">
        <ImageComponent
          class="rounded-xl object-cover transition-transform duration-200 ease-in-out hover:scale-[1.04] hover:shadow-lg w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] md:w-[180px] md:h-[180px] lg:w-[300px] lg:h-[300px]"
          :imageSrc="makeItGif" altText="Make it" />
        <ImageComponent
          class="rounded-xl object-cover transition-transform duration-200 ease-in-out hover:scale-[1.04] hover:shadow-lg w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] md:w-[180px] md:h-[180px] lg:w-[300px] lg:h-[300px]"
          :imageSrc="buyItGif" altText="Buy it" />
        <ImageComponent
          class="rounded-xl object-cover transition-transform duration-200 ease-in-out hover:scale-[1.04] hover:shadow-lg w-[110px] h-[110px] sm:w-[140px] sm:h-[140px] md:w-[180px] md:h-[180px] lg:w-[300px] lg:h-[300px]"
          :imageSrc="sellItGif" altText="Sell it" />
        <!-- Tagline suprapus pe partea de jos a gif-urilor -->
       
      </div>
      <!-- Titlu -->
      <div
        class="flex mt-12 sm:mt-6 md:mt-16 lg:mt-32 xl:mt-32 mb-4 text-[2rem] md:text-[3rem] lg:text-[4rem] justify-center text-center"
        :class="isDark ? 'text-white' : 'text-[#583826]'">
        Cele mai apreciate creații ale lunii {{ currentMonth }}
      </div>
      <!-- Carousel -->
      <div class="px-2 sm:px-4 md:px-8 lg:px-16 xl:px-32">
        <CarouselShop :products="topProducts" />
      </div>

      <!-- Testimoniale -->
      <div class="w-full max-w-6xl mx-auto mt-16 mb-8 px-4">
        <div class="text-center max-w-xl mx-auto mb-10">
          <h2 class="text-3xl md:text-4xl font-bold mb-3" :class="isDark ? 'text-white' : 'text-[#583826]'">
            Ce spun utilizatorii
          </h2>
          <div class="flex justify-center mb-6">
            <span class="inline-block w-1 h-1 rounded-full mx-1"
              :style="{ background: isDark ? '#fff' : '#583826' }"></span>
            <span class="inline-block w-3 h-1 rounded-full mx-1"
              :style="{ background: isDark ? '#fff' : '#583826' }"></span>
            <span class="inline-block w-40 h-1 rounded-full"
              :style="{ background: isDark ? '#fff' : '#583826' }"></span>
            <span class="inline-block w-3 h-1 rounded-full mx-1"
              :style="{ background: isDark ? '#fff' : '#583826' }"></span>
            <span class="inline-block w-1 h-1 rounded-full mx-1"
              :style="{ background: isDark ? '#fff' : '#583826' }"></span>
          </div>
        </div>
        <div v-if="loadingTestimonials" class="text-center text-gray-400">Se încarcă testimonialele...</div>
        <div v-else>
          <div v-if="testimonials.length === 0" class="text-center text-gray-400">Nu există încă testimoniale.</div>
          <div v-else class="w-full flex justify-center">
            <div class="flex flex-wrap justify-center gap-6" style="max-width: 1800px;">
              <div v-for="t in testimonials" :key="t.id"
                class="rounded-2xl bg-[#fef3ec] dark:bg-[#583826] border border-[#d4a373]/30 dark:border-[#b5838d]/20 p-6 shadow-lg flex flex-col items-center min-w-[280px] max-w-xs w-full">
                <div class="flex items-center mb-3">
                  <img v-if="t.photoURL" :src="t.photoURL" alt="avatar"
                    class="w-12 h-12 rounded-full border-2 border-[#d4a373] dark:border-[#b5838d] bg-white mr-3" />
                  <div class="font-semibold text-[#b5838d] text-lg">{{ t.name }}</div>
                </div>
                <p class="italic text-[#7f5539] dark:text-[#fef3ec] text-center flex-1">
                  <span class="text-2xl text-[#d4a373] font-bold leading-none mr-1">“</span>
                  {{ t.message }}
                  <span class="text-2xl text-[#d4a373] font-bold leading-none ml-1">”</span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Formular adăugare/actualizare testimonial -->
      <div v-if="user && userProfile" class="max-w-lg mx-auto mb-16 px-4">
        <div
          class="rounded-2xl bg-white dark:bg-[#583826] border border-[#d4a373]/30 dark:border-[#b5838d]/20 p-8 shadow-xl">
          <h3 class="text-xl font-semibold text-[#b5838d] mb-4 text-center">
            {{ userTestimonialId ? 'Testimonialul tău' : 'Lasă un testimonial' }}
          </h3>
          <div v-if="showSuccess" class="text-green-600 text-center font-semibold mb-2 transition-all duration-300">
            {{ successMessage }}
          </div>
          <div class="flex items-center gap-3 mb-2 justify-center">
            <img v-if="userProfile.photoURL" :src="userProfile.photoURL" alt="avatar"
              class="w-10 h-10 rounded-full border-2 border-[#d4a373] dark:border-[#b5838d] bg-white"
              @error="e => e.target.src = defaultAvatar" />
            <span class="font-medium text-[#b5838d]">{{ userProfile.displayName || user.displayName || 'Anonim'
              }}</span>
          </div>
          <!-- Dacă există testimonial și nu e în editare, afișează testimonialul și butonul Modifică -->
          <div v-if="userTestimonialId && !editMode" class="flex flex-col items-center gap-2">
            <div
              class="italic text-[#7f5539] dark:text-[#fef3ec] text-center border border-[#d4a373]/30 dark:border-[#b5838d]/20 rounded-lg px-4 py-2 bg-[#fef3ec] dark:bg-[#8f7f76]">
              {{ newTestimonial.message }}
            </div>
            <button @click="editMode = true"
              class="mt-2 bg-[#b5838d] text-white rounded-full px-6 py-2 font-semibold hover:bg-[#a98467] transition">
              Modifică
            </button>
          </div>
          <!-- Dacă nu există testimonial sau e în editare, arată textarea și butonul de submit -->
          <form v-else @submit.prevent="addOrUpdateTestimonial" class="flex flex-col gap-3">
            <textarea v-model="newTestimonial.message" placeholder="Mesajul tău"
              class="rounded-lg border border-[#d4a373] p-2 bg-white dark:bg-[#8f7f76] dark:text-white" maxlength="250"
              rows="3"></textarea>
            <button type="submit" :disabled="submitting"
              class="bg-[#b5838d] text-white rounded-full px-6 py-2 font-semibold hover:bg-[#a98467] transition disabled:opacity-60">
              {{ userTestimonialId ? 'Salvează modificările' : 'Trimite' }}
            </button>
            <div v-if="error" class="text-red-500 text-sm text-center">{{ error }}</div>
            <div v-if="userTestimonialId" class="text-green-600 text-xs text-center">Poți modifica testimonialul tău
              oricând.</div>
          </form>
        </div>
      </div>
      <ButtonAdd />
    </div>
  </div>
</template>

<style scoped>
.gif-card {
  border-radius: 0.75rem;
  width: 90px;
  height: 90px;
  max-width: 22vw;
  max-height: 22vw;
  transition: transform 0.18s cubic-bezier(.4, 0, .2, 1), box-shadow 0.18s cubic-bezier(.4, 0, .2, 1);
  box-shadow: none;
  object-fit: cover;
  display: block;
  margin: 0 auto;
}

.gif-card:hover {
  transform: scale(1.07);
  box-shadow: 0 8px 24px 0 rgba(0, 0, 0, 0.13);
}

@media (min-width: 768px) {
  .gif-card {
    width: 120px;
    height: 120px;
  }
}

@media (min-width: 1024px) {
  .gif-card {
    width: 150px;
    height: 150px;
  }
}

#app {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}
</style>
