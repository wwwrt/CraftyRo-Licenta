<template>
  <!-- Container Principal al Paginii -->
  <div class="fixed inset-x-0 top-14 sm:top-24 h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-6rem)] w-full overflow-hidden">
    <!-- Layout Flex (Listă + Chat) -->
    <div class="flex flex-col items-center sm:flex-row sm:items-stretch gap-4 w-full h-full max-w-6xl mx-auto p-2 sm:p-4">
      
      <!-- ==================================================== -->
      <!-- =========   Coloana 1: Lista Conversații   ========= -->
      <!-- ==================================================== -->
      <div
        v-show="!isMobile || !selectedConversation"
        :style="listStyle"
        :class="[
          'flex-shrink-0 flex flex-col h-full min-h-0 bg-white rounded-2xl shadow-xl overflow-hidden p-0 transition-all duration-500 ease-in-out',
          isMobile || !selectedConversation ? 'w-full' : ''
        ]"
      >
        <!-- Wrapper pentru scroll și efecte de fade -->
        <div class="relative flex-1 min-h-0">
          <!-- Lista iterată de conversații -->
          <div
            ref="listContainerRef"
            @scroll="handleListScroll"
            class="h-full overflow-y-auto hide-scrollbar p-2 sm:p-3"
          >
            <!-- Un singur element (card) din lista de conversații -->
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
              <div class="flex-1 min-w-0 overflow-hidden">
                <div :class="selectedConversation?.id === conv.id ? 'font-semibold text-white' : 'font-semibold text-[#583826]'" class="text-base text-fade truncate text-clip">
                  {{ conv.name || 'Conversatie' }}
                </div>
                <div v-if="conv.productTitle" :class="selectedConversation?.id === conv.id ? 'text-xs text-white/80' : 'text-xs text-[#b5838d]'" class="text-fade truncate text-clip">
                  {{ conv.productTitle }}
                </div>
                <div
                  class="text-sm text-fade truncate text-clip"
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
          <!-- Efect de fade superior la scroll -->
          <div :class="['absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none transition-opacity duration-300 ease-in-out', isScrolledFromTop ? 'opacity-100' : 'opacity-0']"></div>
          <!-- Efect de fade inferior la scroll -->
          <div :class="['absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-300 ease-in-out', !isScrolledToEnd ? 'opacity-100' : 'opacity-0']"></div>
        </div>
      </div>

      <!-- ==================================================== -->
      <!-- =========   Coloana 2: Fereastra de Chat   ========= -->
      <!-- ==================================================== -->
      <div
        v-show="!isMobile || selectedConversation"
        @click="revertListExpansion"
        class="flex flex-col w-full max-w-[340px] sm:w-auto sm:max-w-none flex-1 min-w-0 h-full min-h-0"
      >
        <!-- Wrapper pentru tranziția între starea goală și o conversație selectată -->
        <Transition name="fade" mode="out-in">
          <div v-if="selectedConversation" :key="selectedConversation.id" class="flex flex-col h-full min-h-0 gap-y-4">
            
            <!-- Header Conversație -->
            <div class="flex items-center gap-3 px-4 py-4 bg-white rounded-2xl shadow-md flex-shrink-0">
              <button v-if="isMobile" @click="selectedConversation = null" class="mr-2 p-1 text-[#583826] hover:bg-gray-100 rounded-full">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <template v-if="!otherUser">
                <div class="w-12 h-12 rounded-full bg-gray-200 animate-pulse"></div>
                <div class="flex-1">
                  <div class="h-5 bg-gray-200 rounded-md w-32 animate-pulse"></div>
                </div>
              </template>
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
                  <div v-if="selectedConversation.productTitle" 
                       class="text-sm text-[#b5838d] truncate cursor-pointer hover:underline"
                       @click="goToProductPage(selectedConversation.productId)">
                    {{ selectedConversation.productTitle }}
                  </div>
                </div>
                <img
                  v-if="selectedConversation.productImage"
                  :src="selectedConversation.productImage"
                  class="w-12 h-12 rounded-xl object-cover ml-4 flex-shrink-0 cursor-pointer"
                  alt="produs"
                  @click="goToProductPage(selectedConversation.productId)"
                />
              </template>
            </div>

            <!-- Zona de Afișare a Mesajelor -->
            <div class="flex-1 min-h-0 bg-white rounded-2xl shadow-md relative overflow-hidden">
              <!-- Containerul propriu-zis cu scroll -->
              <div
                class="h-full flex flex-col px-4 py-4 space-y-2 hide-scrollbar overflow-y-auto"
                ref="chatRef"
                @scroll="handleChatScroll"
              >
                <div v-if="loading" class="text-center text-gray-400">Se încarcă...</div>
                <div v-if="!loading && messages.length === 0" class="text-center text-gray-400">Niciun mesaj.</div>
                <template v-for="item in messagesWithDates" :key="item.id">
                  <div v-if="item.type === 'date'" class="text-center text-xs text-gray-400 my-4">
                    <span>{{ formatDateSeparator(item.date) }}</span>
                  </div>
                  <div
                    v-else
                    :class="[
                      'flex w-full mb-2',
                      item.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
                    ]"
                  >
                    <!-- Mesaj trimis de utilizatorul curent -->
                    <div v-if="item.senderId === currentUser?.uid" class="flex flex-col items-end">
                      <!-- Bubble pentru IMAGINE (actualizat cu @click și clasă nouă) -->
                      <template v-if="item.type === 'image'">
                        <img 
                          :src="item.imageUrl" 
                          alt="Imagine atașată" 
                          class="block max-w-[240px] h-auto rounded-2xl shadow-md cursor-pointer"
                          @click="openLightbox(item.imageUrl)"
                        />
                      </template>
                      <!-- Bubble pentru TEXT -->
                      <template v-else-if="item.content">
                        <div class="px-5 py-3 rounded-2xl rounded-br-md shadow-md bg-[#583826] text-white max-w-[70vw] min-w-[48px] break-words">
                          <span>{{ item.content }}</span>
                        </div>
                      </template>
                      <!-- Status și ora -->
                      <div class="text-xs mt-1" style="color: #b0a89f; font-style: italic; text-align: right;">
                        {{ formatTime(item.timestamp) }}
                        <span>· {{ messageStatus(item) }}</span>
                      </div>
                    </div>
                    <!-- Mesaj primit -->
                    <div v-else class="flex flex-col items-start">
                      <!-- Bubble pentru IMAGINE (actualizat cu @click și clasă nouă) -->
                      <template v-if="item.type === 'image'">
                        <img 
                          :src="item.imageUrl" 
                          alt="Imagine atașată" 
                          class="block max-w-[240px] h-auto rounded-2xl shadow-md cursor-pointer"
                          @click="openLightbox(item.imageUrl)"
                        />
                      </template>
                      <!-- Bubble pentru TEXT -->
                      <template v-else-if="item.content">
                        <div class="px-5 py-3 rounded-2xl rounded-bl-md shadow-md bg-[#fef3ec] text-[#583826] max-w-[70vw] min-w-[48px] break-words">
                          <span>{{ item.content }}</span>
                        </div>
                      </template>
                      <!-- Ora -->
                      <div class="text-xs mt-1" style="color: #b0a89f; font-style: italic; text-align: left;">
                        {{ formatTime(item.timestamp) }}
                      </div>
                    </div>
                  </div>
                </template>
              </div>

              <!-- Efect de fade superior la scroll -->
              <div :class="['absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none transition-opacity duration-300 ease-in-out', isChatScrolledFromTop ? 'opacity-100' : 'opacity-0']"></div>
              <!-- Efect de fade inferior la scroll -->
              <div :class="['absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-300 ease-in-out', !isChatScrolledToEnd ? 'opacity-100' : 'opacity-0']"></div>

              <!-- Buton de scroll la final -->
              <Transition name="fade">
                <button
                  v-if="!isChatScrolledToEnd"
                  @click="scrollToBottom"
                  class="absolute bottom-4 right-4 bg-[#583826] text-white rounded-full w-10 h-10 flex items-center justify-center shadow-lg hover:bg-[#8f7f76] transition"
                  title="Mergi la final"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" stroke-width="2">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
              </Transition>
            </div>

            <!-- Previzualizare imagine selectată -->
            <div v-if="imagePreviewUrl" class="relative self-start mx-4 -mb-2">
              <img :src="imagePreviewUrl" class="h-20 w-20 object-cover rounded-lg border-2 border-[#d4a373]" />
              <button @click="removeSelectedImage" class="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">&times;</button>
            </div>

            <!-- Formular Trimitere Mesaj -->
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
              <!-- Buton Atașament -->
              <input type="file" ref="fileInputRef" @change="handleImageSelection" accept="image/*" class="hidden" />
              <button
                type="button"
                @click="triggerFileInput"
                class="flex items-center justify-center bg-white/80 hover:bg-[#faedcd] text-[#583826] rounded-full transition shadow-md"
                style="width:55px; height:55px;"
                title="Atașează o imagine"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m18.375 12.739-7.693 7.693a4.5 4.5 0 0 1-6.364-6.364l10.94-10.94A3 3 0 1 1 19.5 7.372L8.552 18.32m.009-.01-.01.01m5.699-9.941-7.81 7.81a1.5 1.5 0 0 0 2.122 2.122l7.81-7.81" />
                </svg>
              </button>
              <!-- Buton Trimitere -->
              <button
                type="submit"
                class="flex items-center justify-center bg-[#583826] hover:bg-[#8f7f76] text-white rounded-full transition shadow-md"
                :disabled="sending || (!content.trim() && !selectedImageFile)"
                style="width:70px; height:55px;"
                title="Trimite"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-white">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                </svg>
              </button>
            </form>
          </div>
        </Transition>
      </div>
    </div>
  </div>

  <!-- NOU: Lightbox pentru vizualizarea imaginilor -->
  <Teleport to="body">
    <Transition name="lightbox-fade">
      <div v-if="isLightboxOpen" @click="closeLightbox" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
        <Transition name="lightbox-zoom">
          <img v-if="isLightboxOpen" :src="lightboxImageUrl" @click.stop class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
        </Transition>
      </div>
    </Transition>
  </Teleport>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessagesStore } from '@/stores/messagesStore'
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, orderBy, onSnapshot, getDoc, writeBatch, getDocs, where } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { onSnapshot as onDocSnapshot } from 'firebase/firestore'
import axios from 'axios' // NOU: Import pentru Cloudinary

// Cloudinary config
const CLOUD_NAME = 'dsexoi1zt'
const UPLOAD_PRESET = 'CraftyRo'

const messagesStore = useMessagesStore()
const route = useRoute()
const router = useRouter()

// --- Starea componentei ---
const currentUser = ref(null)
const selectedConversation = ref(null)
const enrichedConversations = ref([])
const messages = ref([])
const otherUser = ref(null)
const content = ref('')
const loading = ref(true)
const sending = ref(false)

// Starea UI (responsive, scroll, etc.)
const chatRef = ref(null)
const listContainerRef = ref(null)
const isScrolledFromTop = ref(false)
const isScrolledToEnd = ref(true)
const isMobile = ref(window.innerWidth < 640) // Mobil: sub 640px (sm)
const isTablet = ref(window.innerWidth >= 640 && window.innerWidth < 1280) // Tabletă: între 640px (sm) și 1280px (xl)
const isListTemporarilyExpanded = ref(false)
const listExpansionTimeout = ref(null)

// NOU: Stare pentru scroll-ul din chat
const isChatScrolledFromTop = ref(false)
const isChatScrolledToEnd = ref(true)

// Ref-uri pentru Lightbox
const isLightboxOpen = ref(false)
const lightboxImageUrl = ref('')

// Ref-uri pentru atașarea imaginilor
const fileInputRef = ref(null)
const selectedImageFile = ref(null)
const imagePreviewUrl = ref(null)

// --- Computed Properties ---
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

// --- NOU: Logică pentru Lightbox ---
function openLightbox(imageUrl) {
  lightboxImageUrl.value = imageUrl
  isLightboxOpen.value = true
}

function closeLightbox() {
  isLightboxOpen.value = false
  // Nu este nevoie să facem history.back() aici, deoarece listener-ul 'popstate' se va ocupa de asta
}

function handlePopState() {
  // Dacă lightbox-ul este deschis și utilizatorul apasă "înapoi", închidem lightbox-ul
  if (isLightboxOpen.value) {
    closeLightbox()
  }
}

// --- Image Handling Logic ---
async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  const response = await axios.post(url, formData)
  return response.data.secure_url
}

function triggerFileInput() {
  fileInputRef.value.click()
}

function handleImageSelection(event) {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) { // 5MB limit
    alert('Imaginea trebuie să fie sub 5MB.')
    return
  }
  selectedImageFile.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
  event.target.value = '' // Allow re-selecting the same file
}

function removeSelectedImage() {
  selectedImageFile.value = null
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = null
  }
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

// NOU: Watcher pentru a gestiona starea browser-ului la deschiderea/închiderea lightbox-ului
watch(isLightboxOpen, (isOpen) => {
  if (isOpen) {
    // Adaugă o intrare în istoricul browser-ului pentru a putea folosi butonul "înapoi"
    history.pushState({ lightbox: true }, '')
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
    try {
      messages.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
      loading.value = false
      nextTick(() => {
        // Dacă suntem deja la final, menținem scroll-ul jos. Altfel, lăsăm utilizatorul unde era.
        if (isChatScrolledToEnd.value) {
          if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
        }
        handleChatScroll() // Actualizăm starea fade-urilor
      })
    } catch (error) {
      console.error("Eroare la abonarea la mesaje:", error)
      loading.value = false
    }
  })
}

async function send() {
  if (!content.value.trim() && !selectedImageFile.value) return
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

  try {
    let messageData = {
      senderId: currentUser.value.uid,
      timestamp: serverTimestamp(),
      read: false
    }
    let lastMessageText = ''

    if (selectedImageFile.value) {
      const imageUrl = await uploadImageToCloudinary(selectedImageFile.value)
      messageData.type = 'image'
      messageData.imageUrl = imageUrl
      lastMessageText = '[Imagine]'
    } else {
      messageData.type = 'text'
      messageData.content = content.value
      lastMessageText = content.value
    }

    await addDoc(collection(db, 'conversations', convId, 'messages'), messageData)
    await updateDoc(doc(db, 'conversations', convId), {
      lastMessage: lastMessageText,
      lastMessageSenderId: currentUser.value.uid,
      lastMessageRead: false,
      lastUpdated: serverTimestamp()
    })

    content.value = ''
    removeSelectedImage()
  } catch (error) {
    console.error("Eroare la trimiterea mesajului:", error)
    alert("Nu s-a putut trimite mesajul.")
  } finally {
    sending.value = false
  }
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
  const prefix = conv.lastMessageSenderId === currentUser.value?.uid ? 'Tu: ' : ''
  return prefix + conv.lastMessage
}

function formatTime(ts) {
  if (!ts) return ''
  const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date()
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function messageStatus(msg) {
  return msg.read ? 'Citit' : 'Trimis'
}

// --- UI & Navigation Handlers ---
const onResize = () => {
  const width = window.innerWidth
  // ACTUALIZAT: Aliniem funcția de resize la noile breakpoint-uri
  isMobile.value = width < 640
  isTablet.value = width >= 640 && width < 1280
}

// NOU: Funcție pentru scroll-ul din fereastra de chat
function handleChatScroll() {
  if (!chatRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = chatRef.value
  const threshold = 10
  isChatScrolledFromTop.value = scrollTop > threshold
  isChatScrolledToEnd.value = (scrollTop + clientHeight) >= (scrollHeight - threshold)
}

// NOU: Funcție pentru a derula la finalul conversației
function scrollToBottom() {
  if (chatRef.value) {
    chatRef.value.scrollTo({
      top: chatRef.value.scrollHeight,
      behavior: 'smooth'
    })
  }
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
  window.addEventListener('popstate', handlePopState)
  
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
  })
  nextTick(() => {
    updateScrollState()
    handleChatScroll()
  })
})

onUnmounted(() => {
  if (window._chatUnsub) window._chatUnsub()
  if (convoUnsub) convoUnsub()
  window.removeEventListener('resize', onResize)
  // NOU: Elimină listener-ul la părăsirea componentei
  window.removeEventListener('popstate', handlePopState)
})
</script>

<style scoped>
/* ... (stilurile existente) ... */

/* NOU: Stiluri pentru tranziția Lightbox */
.lightbox-fade-enter-active,
.lightbox-fade-leave-active {
  transition: opacity 0.3s ease;
}
.lightbox-fade-enter-from,
.lightbox-fade-leave-to {
  opacity: 0;
}

.lightbox-zoom-enter-active,
.lightbox-zoom-leave-active {
  transition: transform 0.3s ease;
}
.lightbox-zoom-enter-from,
.lightbox-zoom-leave-to {
  transform: scale(0.8);
}

/* NOU: Stil pentru efectul de fade pe textul care nu încape */
.text-fade {
  mask-image: linear-gradient(to right, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
}
</style>
