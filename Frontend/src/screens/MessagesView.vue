<template>
  <div class="fixed inset-x-0 top-14 sm:top-24 h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-6rem)] w-full overflow-hidden">
    <div class="flex flex-col items-center sm:flex-row sm:items-stretch gap-4 w-full h-full max-w-6xl mx-auto p-2 sm:p-4">
      <!-- Lista de chaturi (cu stil dinamic) -->
      <div
        v-show="!isMobile || !selectedConversation"
        :style="listStyle"
        :class="[
          'flex-shrink-0 flex flex-col h-full min-h-0 bg-white rounded-2xl shadow-xl overflow-hidden p-0 transition-all duration-500 ease-in-out',
          isMobile || !selectedConversation ? 'w-full' : ''
        ]"
      >
        <!-- NOU: Wrapper pentru efectul de fade -->
        <div class="relative flex-1 min-h-0">
          <div
            ref="listContainerRef"
            @scroll="handleListScroll"
            class="h-full overflow-y-auto hide-scrollbar p-2 sm:p-3"
          >
            <div
              v-for="conv in enrichedConversations"
              :key="conv.id"
              @click="() => handleSelectConversation(conv)"
              :class="[
                'flex items-center gap-3 px-4 py-4 cursor-pointer mb-2 transition-all duration-300 ease-in-out transform rounded-xl',
                selectedConversation?.id === conv.id
                  ? 'bg-[#583826] text-white shadow-lg scale-[1.02]'
                  : 'bg-[#fef3ec] text-[#583826] hover:shadow-lg hover:scale-[1.02] hover:bg-[#faedcd]'
              ]"
              style="will-change: transform;"
            >
              <img
                :src="conv.avatar || conv.photoURL || '/default-avatar.png'"
                class="w-12 h-12 rounded-full object-cover"
                alt="avatar"
              />
              <div class="flex-1 min-w-0">
                <div :class="selectedConversation?.id === conv.id ? 'font-semibold text-white' : 'font-semibold text-[#583826]'" class="text-base text-fade">
                  {{ conv.name || 'Conversatie' }}
                </div>
                <!-- ACTUALIZAT: Titlul produsului, afișat mereu dacă există -->
                <div v-if="conv.productTitle" :class="selectedConversation?.id === conv.id ? 'text-xs text-white/80' : 'text-xs text-[#b5838d]'" class="text-fade">
                  {{ conv.productTitle }}
                </div>
                <div
                  class="text-sm text-fade max-w-[180px]"
                  :class="[
                    conv.lastMessageRead === false && conv.lastMessageSenderId !== currentUser?.uid
                      ? 'font-bold'
                      : '',
                    selectedConversation?.id === conv.id ? 'text-white' : 'text-[#583826]'
                  ]"
                >
                  {{ getLastMessage(conv) }}
                </div>
              </div>
              <!-- NOU: Imaginea produsului în listă -->
              <img
                v-if="conv.productImage"
                :src="conv.productImage"
                class="w-12 h-12 rounded-xl object-cover ml-2 flex-shrink-0"
                alt="produs"
              />
              <span v-if="conv.unreadCount > 0"
                :class="selectedConversation?.id === conv.id ? 'bg-white text-[#583826]' : 'bg-[#d4a373] text-white'"
                class="ml-2 text-xs rounded-full px-2 py-0.5">
                {{ conv.unreadCount }}
              </span>
            </div>
          </div>
          <!-- NOU: Fade-out superior -->
          <div :class="['absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none transition-opacity duration-300 ease-in-out', isScrolledFromTop ? 'opacity-100' : 'opacity-0']"></div>
          <!-- NOU: Fade-out inferior -->
          <div :class="['absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-300 ease-in-out', !isScrolledToEnd ? 'opacity-100' : 'opacity-0']"></div>
        </div>
      </div>

      <!-- Card conversație (cu v-show și @click actualizate) -->
      <div
        v-show="!isMobile || selectedConversation"
        @click="revertListExpansion"
        class="flex flex-col w-full max-w-[340px] sm:w-auto sm:max-w-none flex-1 min-w-0 h-full min-h-0"
      >
        <!-- NOU: Wrapper pentru tranziție -->
        <Transition name="fade" mode="out-in">
          <div v-if="selectedConversation" :key="selectedConversation.id" class="flex flex-col h-full min-h-0 gap-y-4">
            <!-- Header ca un card -->
            <div class="flex items-center gap-3 px-4 py-4 bg-white rounded-2xl shadow-md flex-shrink-0">
              <button v-if="isMobile" @click="selectedConversation = null" class="mr-2 p-1 text-[#583826] hover:bg-gray-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              
              <!-- Skeleton Loader (FIX PENTRU GLITCH) -->
              <template v-if="!otherUser">
                <div class="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                <div class="flex-1">
                  <div class="h-5 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                </div>
              </template>

              <!-- Conținutul real al header-ului -->
              <template v-else>
                <img
                  :src="otherUser.photoURL || '/default-avatar.png'"
                  class="w-12 h-12 rounded-full object-cover border border-[#faedcd]"
                  alt="avatar"
                />
                <div class="flex-1 min-w-0">
                  <div class="font-semibold text-[#7f5539] text-lg cursor-pointer hover:underline truncate"
                    @click="goToUserProfile(otherUserId)">
                    {{ otherUser.displayName || otherUser.name || 'Utilizator' }}
                  </div>
                  <!-- ACTUALIZAT: Titlul produsului devine un link -->
                  <div v-if="selectedConversation.productTitle" 
                       class="text-sm text-[#b5838d] truncate cursor-pointer hover:underline"
                       @click="goToProductPage(selectedConversation.productId)">
                    {{ selectedConversation.productTitle }}
                  </div>
                </div>
                <!-- ACTUALIZAT: Imaginea produsului devine un link -->
                <img
                  v-if="selectedConversation.productImage"
                  :src="selectedConversation.productImage"
                  class="w-12 h-12 rounded-xl object-cover ml-4 flex-shrink-0 cursor-pointer"
                  alt="produs"
                  @click="goToProductPage(selectedConversation.productId)"
                />
              </template>
            </div>
            <!-- Mesaje ca un card -->
            <div
              class="flex-1 min-h-0 flex flex-col bg-white rounded-2xl shadow-md px-4 py-4 space-y-2 relative hide-scrollbar overflow-y-auto"
              ref="chatRef"
            >
              <div v-if="loading" class="text-center text-gray-400">Se încarcă...</div>
              <div v-if="!loading && messages.length === 0" class="text-center text-gray-400">Niciun mesaj.</div>
              <!-- ACTUALIZAT: Iterăm prin lista cu separatoare de dată -->
              <template v-for="item in messagesWithDates" :key="item.id">
                <!-- Afișăm separatorul de dată -->
                <div v-if="item.type === 'date'" class="text-center text-xs text-gray-400 my-4">
                  <span>{{ formatDateSeparator(item.date) }}</span>
                </div>
                <!-- Afișăm mesajul -->
                <div
                  v-else
                  :class="[
                    'flex w-full mb-2',
                    item.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
                  ]"
                >
                  <div v-if="item.senderId === currentUser?.uid" class="flex flex-col items-end">
                    <div class="px-5 py-3 rounded-2xl rounded-br-md shadow-md bg-[#583826] text-white max-w-[70vw] min-w-[48px] break-words">
                      <span>{{ item.content }}</span>
                    </div>
                    <div class="text-xs mt-1" style="color: #b0a89f; font-style: italic; text-align: right;">
                      {{ formatTime(item.timestamp) }}
                      <span>· {{ messageStatus(item) }}</span>
                    </div>
                  </div>
                  <div v-else class="flex flex-col items-start">
                    <div class="px-5 py-3 rounded-2xl rounded-bl-md shadow-md bg-[#fef3ec] text-[#583826] max-w-[70vw] min-w-[48px] break-words">
                      <span>{{ item.content }}</span>
                    </div>
                    <div class="text-xs mt-1" style="color: #b0a89f; font-style: italic; text-align: left;">
                      {{ formatTime(item.timestamp) }}
                    </div>
                  </div>
                </div>
              </template>
            </div>
            <!-- Bara de typing (cu @click actualizat) -->
            <form
              @submit.prevent="send"
              @click="revertListExpansion"
              class="flex gap-2 items-center w-full pt-2 flex-shrink-0 px-0 -mt-2"
              style="backdrop-filter: blur(8px);"
            >
              <textarea
                v-model="content"
                class="flex-1 rounded-full border-none px-4 py-4 resize-none focus:outline-none bg-white/ text-[#583826] placeholder-[#b0a89f] shadow-md"
                rows="1"
                placeholder="Scrie un mesaj..."
                :disabled="sending"
                @keydown.enter.exact.prevent="send"
                style="font-family: inherit;"
              ></textarea>
              <button
                type="submit"
                class="flex items-center justify-center bg-[#583826] hover:bg-[#8f7f76] text-white rounded-full transition shadow-md"
                :disabled="sending || !content.trim()"
                style="width:70px; height:55px;"
                title="Trimite"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-white">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </div>
          <!-- ELIMINAT: Mesajul "Selectează o conversație" a fost scos -->
        </Transition>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessagesStore } from '@/stores/messagesStore'
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, orderBy, onSnapshot, getDoc, writeBatch, getDocs, where } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { onSnapshot as onDocSnapshot } from 'firebase/firestore'

const messagesStore = useMessagesStore()
const route = useRoute()
const router = useRouter()

// --- Starea componentei ---
const currentUser = ref(null)
const selectedConversation = ref(null)
const enrichedConversations = ref([]) // SURSA DE ADEVĂR PENTRU LISTĂ
const messages = ref([])
const otherUser = ref(null)
const content = ref('')
const loading = ref(true)
const sending = ref(false)

// --- Ref-uri pentru UI ---
const chatRef = ref(null)
const listContainerRef = ref(null)
const isScrolledFromTop = ref(false)
const isScrolledToEnd = ref(true)
// ACTUALIZAT: Breakpoint-uri aliniate cu Tailwind CSS
const isMobile = ref(window.innerWidth < 640) // Mobil: sub 640px (sm)
const isTablet = ref(window.innerWidth >= 640 && window.innerWidth < 1280) // Tabletă: între 640px (sm) și 1280px (xl)
const isListTemporarilyExpanded = ref(false)
const listExpansionTimeout = ref(null)

// NOU: Proprietate computed pentru a gestiona lățimea listei
const listStyle = computed(() => {
  if (isMobile.value || !selectedConversation.value) return {}
  if (!isTablet.value) return { width: '420px' } // Desktop: lățime fixă
  if (isListTemporarilyExpanded.value) return { width: '420px' } // Tabletă la scroll: lățime fixă
  // ACTUALIZAT: Formulă pentru a începe redimensionarea de la 640px
  return { width: 'clamp(240px, calc(28.125vw + 60px), 420px)' }
})

// NOU: Proprietate computed care adaugă separatoare de dată între mesaje
const messagesWithDates = computed(() => {
  const result = []
  let lastDate = null
  messages.value.forEach(msg => {
    const msgDate = msg.timestamp?.toDate().toDateString()
    if (msgDate && msgDate !== lastDate) {
      result.push({ type: 'date', id: msgDate, date: msg.timestamp.toDate() })
      lastDate = msgDate
    }
    result.push({ type: 'message', ...msg })
  })
  return result
})

// --- Proprietăți calculate ---
const rawConversations = computed(() => messagesStore.conversations)
const otherUserId = computed(() => {
  if (!selectedConversation.value || !currentUser.value) return null
  return selectedConversation.value.members.find(uid => uid !== currentUser.value.uid)
})

// --- Funcții Helper ---
async function fetchProductDetails(productId) {
  if (!productId) return {}
  try {
    const productDoc = await getDoc(doc(db, 'products', productId))
    if (productDoc.exists()) {
      const data = productDoc.data()
      return {
        productTitle: data.name,
        productImage: data.images && data.images.length > 0 ? data.images[0] : null
      }
    }
  } catch (error) {
    console.error("Eroare la preluarea detaliilor produsului:", error)
  }
  return {}
}

// --- Logică principală (Watchers) ---

// 1. La schimbarea listei brute de la store, o îmbogățim cu detalii de produs
watch(rawConversations, async (newConvs) => {
  if (newConvs && newConvs.length > 0) {
    const promises = newConvs.map(async (conv) => {
      const productDetails = await fetchProductDetails(conv.productId)
      return { ...conv, ...productDetails }
    })
    enrichedConversations.value = await Promise.all(promises)

    // După ce lista e gata, încercăm să selectăm conversația din URL
    if (currentUser.value) {
      selectConversationByQuery()
    }
    
    // Dacă o conversație era deja selectată, o reîmprospătăm cu noile date
    if (selectedConversation.value) {
        const updatedSelection = enrichedConversations.value.find(c => c.id === selectedConversation.value.id);
        if (updatedSelection) {
          selectedConversation.value = updatedSelection;
        }
    }

  } else {
    enrichedConversations.value = []
  }
  await nextTick()
  updateScrollState()
}, { deep: true })

// 2. La schimbarea userului, resetăm tot
watch(currentUser, (user) => {
  if (user) {
    messagesStore.clearStore()
    selectedConversation.value = null
    enrichedConversations.value = []
    messages.value = []
    otherUser.value = null
    messagesStore.fetchConversations(user.uid)
  }
})

// 3. La schimbarea conversației selectate, ne abonăm la mesaje și la actualizări
let convoUnsub = null
watch(selectedConversation, (newVal, oldVal) => {
  if (oldVal && convoUnsub) {
    convoUnsub()
    convoUnsub = null
  }
  if (newVal) {
    fetchOtherUser()
    subscribeToMessages()
    subscribeToConversation()
  }
})

// --- Acțiuni ---

async function handleSelectConversation(conv) {
  if (selectedConversation.value?.id === conv.id) return

  messages.value = []
  otherUser.value = null
  loading.value = true
  selectedConversation.value = conv

  // Marcare mesaje ca citite
  const q = query(
    collection(db, 'conversations', conv.id, 'messages'),
    where('read', '==', false),
    where('senderId', '!=', currentUser.value.uid)
  )
  const snap = await getDocs(q)
  if (!snap.empty) {
    const batch = writeBatch(db)
    snap.forEach(docSnap => batch.update(docSnap.ref, { read: true }))
    await batch.commit()
    await updateDoc(doc(db, 'conversations', conv.id), { lastMessageRead: true })
  }
}

function subscribeToConversation() {
  if (!selectedConversation.value) return
  const convoRef = doc(db, 'conversations', selectedConversation.value.id)
  convoUnsub = onDocSnapshot(convoRef, (docSnap) => {
    if (docSnap.exists() && selectedConversation.value) {
      // Folosim Object.assign pentru a actualiza conversația FĂRĂ a șterge detaliile de produs
      Object.assign(selectedConversation.value, docSnap.data())
    }
  })
}

function subscribeToMessages() {
  if (!selectedConversation.value) return
  const q = query(
    collection(db, 'conversations', selectedConversation.value.id, 'messages'),
    orderBy('timestamp')
  )
  if (window._chatUnsub) window._chatUnsub()
  window._chatUnsub = onSnapshot(q, async snap => {
    messages.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    loading.value = false
    nextTick(() => {
      if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
    })
  })
}

async function send() {
  if (!content.value.trim()) return
  sending.value = true

  let convId = selectedConversation.value?.id

  if (!convId) {
    const newConvRef = await addDoc(collection(db, 'conversations'), {
      members: [currentUser.value.uid, route.query.sellerId],
      productId: route.query.productId,
      lastMessage: '',
      lastUpdated: serverTimestamp()
    })
    convId = newConvRef.id
    // Forțăm reîncărcarea listei, care va declanșa watcher-ul de îmbogățire
    await messagesStore.fetchConversations(currentUser.value.uid)
  }

  const msg = {
    senderId: currentUser.value.uid,
    content: content.value,
    timestamp: serverTimestamp(),
    read: false
  }
  await addDoc(collection(db, 'conversations', convId, 'messages'), msg)
  await updateDoc(doc(db, 'conversations', convId), {
    lastMessage: content.value,
    lastMessageSenderId: currentUser.value.uid,
    lastMessageRead: false,
    lastUpdated: serverTimestamp()
  })
  content.value = ''
  sending.value = false
}

function selectConversationByQuery() {
  const { sellerId, productId } = route.query
  if (!sellerId || !productId || !currentUser.value) return

  const conv = enrichedConversations.value.find(
    c => c.productId === productId && c.members?.includes(sellerId)
  )
  if (conv) {
    handleSelectConversation(conv)
  }
}

async function fetchOtherUser() {
  if (!otherUserId.value) return
  const userDoc = await getDoc(doc(db, 'users', otherUserId.value))
  if (userDoc.exists()) {
    otherUser.value = userDoc.data()
  } else {
    otherUser.value = null
  }
}

// --- Funcții de formatare și UI ---

// NOU: Funcție pentru a formata data pentru separatoare
function formatDateSeparator(date) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) {
    return 'Astăzi'
  }
  if (date.toDateString() === yesterday.toDateString()) {
    return 'Ieri'
  }
  return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}

function getLastMessage(conv) {
  if (!conv.lastMessage) return ''
  return conv.lastMessageSenderId === currentUser.value?.uid
    ? 'Tu: ' + conv.lastMessage
    : conv.lastMessage
}

function formatTime(ts) {
  if (!ts) return ''
  const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date()
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function messageStatus(msg) {
  return msg.read ? 'Citit' : 'Trimis'
}

const onResize = () => {
  const width = window.innerWidth
  // ACTUALIZAT: Aliniem funcția de resize la noile breakpoint-uri
  isMobile.value = width < 640
  isTablet.value = width >= 640 && width < 1280
}

function updateScrollState() {
  if (!listContainerRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = listContainerRef.value
  const threshold = 5
  isScrolledFromTop.value = scrollTop > threshold
  isScrolledToEnd.value = (scrollTop + clientHeight) >= (scrollHeight - threshold)
}

// ACTUALIZAT: Funcția gestionează lățirea listei DOAR pe tabletă
function handleListScroll() {
  if (isTablet.value && selectedConversation.value) {
    if (listExpansionTimeout.value) clearTimeout(listExpansionTimeout.value)
    isListTemporarilyExpanded.value = true
    listExpansionTimeout.value = setTimeout(() => {
      isListTemporarilyExpanded.value = false
    }, 5000) // Revine la normal după 5 secunde
  }
  updateScrollState()
}

// NOU: Funcție pentru a reveni la starea normală la click
function revertListExpansion() {
  if (isListTemporarilyExpanded.value) {
    isListTemporarilyExpanded.value = false
    if (listExpansionTimeout.value) clearTimeout(listExpansionTimeout.value)
  }
}

function goToUserProfile(userId) {
  if (userId) router.push({ name: 'user-profile', params: { id: userId } })
}

// NOU: Funcție pentru a naviga la pagina produsului
function goToProductPage(productId) {
  if (productId) {
    router.push({ name: 'product-detail', params: { id: productId } })
  }
}

// --- Cicluri de viață ---
onMounted(() => {
  window.addEventListener('resize', onResize)
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
  })
  nextTick(updateScrollState)
})

onUnmounted(() => {
  if (window._chatUnsub) window._chatUnsub()
  if (convoUnsub) convoUnsub()
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
/* NU MAI SUNT NEVOIE DE STILURI SUPLIMENTARE, TOATE SUNT GESTIONATE PRIN TAILWIND CSS */
</style>
