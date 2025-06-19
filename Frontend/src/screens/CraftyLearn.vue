<template>
  <div class="flex justify-center items-start min-h-[70vh] pt-10 pb-16">
    <div class="learn-container">
      <h1 class="text-3xl font-semibold mb-5 text-[#583826] dark:text-white text-center">#Make it - Creează-ți propriile
        produse!</h1>

      <div class="max-w-md mx-auto mb-7">
        <input type="text" v-model="searchQuery" placeholder="Caută după titlu..."
          class="w-full px-3.5 py-2.5 border border-gray-300 dark:border-[#fef3ec] rounded-xl text-sm dark:bg-[#8f7f76] dark:text-white" />
      </div>

      <div v-if="filteredVideos.length" class="w-full flex justify-center">
        <div class="flex flex-wrap justify-center gap-6" style="max-width: 1800px;">
          <div v-for="video in filteredVideos" :key="video.id" class="p-4 relative">
            <div class="bg-[#6d4b31] dark:bg-[#fef3ec] rounded-2xl shadow-md flex flex-col items-center p-4 h-full relative overflow-hidden">
              <VideoLearn :video="video" @loading="setLoading(video.id, $event)" />
              <div
                v-if="loadingVideos.includes(video.id) && !loadedVideos.includes(video.id)"
                class="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-[#583826]/70 z-10"
              >
                <svg class="animate-spin h-8 w-8 text-[#b5838d]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
      <p v-else class="text-center text-gray-500 dark:text-gray-400 mt-12">Niciun videoclip găsit.</p>
    </div>

    <!-- <button @click="showModal = true"
      class="group fixed z-50 bottom-8 left-1/2 -translate-x-1/2 flex items-center justify-center gap-2 px-6 py-3 bg-[#fef3ec] text-[#b5838d] border-2 border-[#d4a373] rounded-full font-semibold shadow-lg transition-all duration-200 hover:bg-[#d4a373] hover:text-white hover:scale-105 focus:outline-none text-lg"
      style="box-shadow: 0 6px 32px 0 rgba(212,163,115,0.25);">
      <svg class="w-6 h-6 transition-colors duration-200 group-hover:text-white" fill="none" stroke="currentColor"
        stroke-width="2" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
      </svg>
      Adaugă videoclip
    </button> -->

    <div v-if="showModal" class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-10"
      @click.self="showModal = false">
      <div class="bg-white dark:bg-gray-800 p-6 rounded-xl w-11/12 max-w-md shadow-lg">
        <h2 class="mb-4 text-xl text-center font-semibold dark:text-white">Adaugă videoclip nou</h2>
        <form @submit.prevent="addVideo">
          <input v-model="newVideo.title" type="text" placeholder="Titlu" required
            class="w-full mb-3 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
          <input v-model="newVideo.src" type="text" placeholder="Link YouTube" required
            class="w-full mb-3 p-2.5 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white" />
          <div class="flex justify-between mt-4">
            <button type="submit"
              class="flex-1 py-2.5 px-4 mx-1.5 bg-gray-800 hover:bg-gray-700 text-white rounded-lg cursor-pointer font-medium transition-colors">
              Adaugă
            </button>
            <button type="button"
              class="flex-1 py-2.5 px-4 mx-1.5 bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 rounded-lg cursor-pointer font-medium transition-colors"
              @click="showModal = false">
              Anulează
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script>
import { collection, getDocs, addDoc } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import VideoLearn from '../components/VideoLearn.vue'

export default {
  name: 'CraftyLearn',
  components: { VideoLearn },
  data() {
    return {
      videos: [],
      searchQuery: '',
      showModal: false,
      newVideo: {
        title: '',
        src: ''
      },
      loadingVideos: [],
      loadedVideos: [],
    }
  },
  computed: {
    filteredVideos() {
      const q = this.searchQuery.toLowerCase()
      if (!this.videos) return []
      return this.videos.filter(video =>
        video.title?.toLowerCase().includes(q)
      )
    }
  },
  methods: {
    async fetchVideosAndTutorials() {
      // 1. Ia videoclipurile din colecția videos
      const snapshot = await getDocs(collection(db, 'videos'))
      const videos = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }))

      // 2. Ia produsele cu tutorial din colecția products
      const productsSnap = await getDocs(collection(db, 'products'))
      const productTutorials = productsSnap.docs
        .map(doc => ({ id: doc.id, ...doc.data() }))
        .filter(prod => prod.tutorial && prod.tutorial.startsWith('http'))
        .map(prod => ({
          id: 'prod-' + prod.id,
          title: prod.name || 'Tutorial produs',
          src: prod.tutorial
        }))

      // 3. Combină și elimină duplicatele după link
      const allVideos = [...videos, ...productTutorials]
      const uniqueVideos = []
      const seen = new Set()
      for (const vid of allVideos) {
        if (!seen.has(vid.src)) {
          uniqueVideos.push(vid)
          seen.add(vid.src)
        }
      }
      this.videos = uniqueVideos
    },
    async addVideo() {
      if (!this.newVideo.title.trim() || !this.newVideo.src.trim()) {
        console.error('Titlul și link-ul sunt obligatorii.')
        return
      }
      try {
        await addDoc(collection(db, 'videos'), {
          title: this.newVideo.title.trim(),
          src: this.newVideo.src.trim()
        })
        this.newVideo.title = ''
        this.newVideo.src = ''
        this.showModal = false
        this.fetchVideosAndTutorials()
      } catch (e) {
        console.error('Eroare la adăugarea videoclipului:', e)
      }
    },
    setLoading(id, isLoading) {
      if (isLoading && !this.loadingVideos.includes(id) && !this.loadedVideos.includes(id)) {
        this.loadingVideos.push(id)
      } else if (!isLoading) {
        this.loadingVideos = this.loadingVideos.filter(vId => vId !== id)
        if (!this.loadedVideos.includes(id)) {
          this.loadedVideos.push(id)
          // Salvează în localStorage
          localStorage.setItem('craftyLoadedVideos', JSON.stringify(this.loadedVideos))
        }
      }
    }
  },
  mounted() {
    const loaded = localStorage.getItem('craftyLoadedVideos')
    if (loaded) {
      this.loadedVideos = JSON.parse(loaded)
    }
    this.fetchVideosAndTutorials()
  }
}
</script>

<style scoped>
.learn-container {
  max-width: 90%;
  margin: 40px auto;
  padding: 32px 24px;
  border-radius: 16px;
  background-color: #fff; /* Asigură fundal alb pentru light mode */
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.08);
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: background-color 0.8s cubic-bezier(.4,0,.2,1), color 0.8s cubic-bezier(.4,0,.2,1);
}

/* Aplică fundalul maro doar dacă clasa 'dark' este pe html ȘI preferința de sistem este dark */
/* Sau, mai simplu, lasă Tailwind să gestioneze asta și elimină complet media query-ul de aici */
/* Pentru a folosi DOAR Tailwind, șterge media query-ul de mai jos și asigură-te că ai: */
/* <div class="learn-container bg-white dark:bg-[#583826]"> în template */

@media (prefers-color-scheme: dark) {
  html.dark .learn-container { /* Specificitate mai mare pentru a suprascrie Tailwind dacă e nevoie */
    background-color: #583826;
  }
}
</style>
