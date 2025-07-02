<template>
  <div>
    <div class="fixed inset-x-0 top-14 sm:top-24 h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-6rem)] w-full overflow-hidden">
      <div class="flex flex-col items-center sm:flex-row sm:items-stretch gap-4 w-full h-full max-w-6xl mx-auto p-2 sm:p-4">
        
        <!-- Lista de Conversații -->
        <div
          v-show="!isMobile || !selectedConversation"
          :style="listStyle"
          :class="[
            'flex-shrink-0 flex flex-col h-full min-h-0 bg-white rounded-2xl shadow-xl overflow-hidden p-0 transition-all duration-500 ease-in-out',
            !selectedConversation ? 'w-full' : ''
          ]"
        >
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
                  @error="$event.target.src = '/default-avatar.png'"
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
            <div :class="['absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none transition-opacity duration-300 ease-in-out', isScrolledFromTop ? 'opacity-100' : 'opacity-0']"></div>
            <div :class="['absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-300 ease-in-out', !isScrolledToEnd ? 'opacity-100' : 'opacity-0']"></div>
          </div>
        </div>

        <!-- Fereastra de Chat -->
        <div
          v-if="selectedConversation"
          @click="revertListExpansion"
          class="flex flex-col w-full max-w-[340px] sm:w-auto sm:max-w-none flex-1 min-w-0 h-full min-h-0"
        >
          <Transition name="fade" mode="out-in" @after-enter="onTransitionComplete">
            <div :key="selectedConversation.id" class="flex flex-col h-full min-h-0 gap-y-4">
              
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
                    class="w-12 h-12 rounded-xl object-cover ml-4 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
                    alt="produs"
                    @click="goToProductPage(selectedConversation.productId)"
                  />
                </template>
              </div>

              <!-- Container Mesaje -->
              <div class="flex-1 min-h-0 bg-white rounded-2xl shadow-md relative overflow-hidden">
                <div v-if="isTransitioning || loading" class="h-full flex items-center justify-center">
                  <div class="text-center text-gray-400">
                    <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-[#583826] mx-auto mb-2"></div>
                    <span>Se încarcă...</span>
                  </div>
                </div>
                
                <div
                  v-show="!isTransitioning && !loading"
                  class="h-full flex flex-col px-4 py-4 space-y-2 hide-scrollbar overflow-y-auto"
                  ref="chatRef"
                  @scroll="handleChatScroll"
                >
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
                      <div v-if="item.senderId === currentUser?.uid" class="flex flex-col items-end">
                        <template v-if="item.type === 'image'">
                          <img 
                            :src="getOptimizedImageUrl(item.imageUrl)" 
                            alt="Imagine atașată" 
                            class="block max-w-[65vw] sm:max-w-[240px] h-auto rounded-2xl rounded-br-md shadow-md cursor-pointer"
                            @click="openLightbox(item.imageUrl)"
                          />
                        </template>
                        <template v-else-if="item.content">
                          <div class="px-5 py-3 rounded-2xl rounded-br-md shadow-md bg-[#583826] text-white max-w-[70vw] min-w-[48px] break-words">
                            <span>{{ item.content }}</span>
                          </div>
                        </template>
                        <div class="text-xs mt-1" style="color: #b0a89f; font-style: italic; text-align: right;">
                          {{ formatTime(item.timestamp) }}
                          <span>· {{ messageStatus(item) }}</span>
                        </div>
                      </div>
                      <div v-else class="flex flex-col items-start">
                        <template v-if="item.type === 'image'">
                          <img 
                            :src="getOptimizedImageUrl(item.imageUrl)" 
                            alt="Imagine atașată" 
                            class="block max-w-[65vw] sm:max-w-[240px] h-auto rounded-2xl rounded-bl-md shadow-md cursor-pointer"
                            @click="openLightbox(item.imageUrl)"
                          />
                        </template>
                        <template v-else-if="item.content">
                          <div class="px-5 py-3 rounded-2xl rounded-bl-md shadow-md bg-[#fef3ec] text-[#583826] max-w-[70vw] min-w-[48px] break-words">
                            <span>{{ item.content }}</span>
                          </div>
                        </template>
                        <div class="text-xs mt-1" style="color: #b0a89f; font-style: italic; text-align: left;">
                          {{ formatTime(item.timestamp) }}
                        </div>
                      </div>
                    </div>
                  </template>
                </div>

                <div 
                  v-show="!isTransitioning && !loading"
                  :class="['absolute top-0 left-0 right-0 h-12 bg-gradient-to-b from-white to-transparent pointer-events-none transition-opacity duration-300 ease-in-out', isChatScrolledFromTop ? 'opacity-100' : 'opacity-0']"
                ></div>
                <div 
                  v-show="!isTransitioning && !loading"
                  :class="['absolute bottom-0 left-0 right-0 h-12 bg-gradient-to-t from-white to-transparent pointer-events-none transition-opacity duration-300 ease-in-out', !isChatScrolledToEnd ? 'opacity-100' : 'opacity-0']"
                ></div>
                <Transition name="fade">
                  <button
                    v-if="!isChatScrolledToEnd && !isTransitioning && !loading"
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

              <!-- Preview Imagine -->
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

      <!-- Lightbox -->
      <Teleport to="body">
        <Transition name="lightbox-fade">
          <div v-if="isLightboxOpen" @click="closeLightbox" class="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4">
            <Transition name="lightbox-zoom">
              <img v-if="isLightboxOpen" :src="getOptimizedImageUrl(lightboxImageUrl)" @click.stop class="max-w-full max-h-full object-contain rounded-lg shadow-2xl" />
            </Transition>
          </div>
        </Transition>
      </Teleport>
    </div>
  </div>
</template>

<script setup>
/**
 * =====================================================================================
 * MESSAGESVIEW - SISTEM COMPLET DE MESAGERIE ÎN TIMP REAL
 * =====================================================================================
 * 
 * DESCRIERE GENERALĂ:
 * Această componentă implementează un sistem complet de mesagerie în timp real pentru
 * platforma CraftyRo. Oferă o interfață intuitivă pentru comunicarea între utilizatori
 * în contextul tranzacțiilor de produse handmade.
 * 
 * FUNCȚIONALITĂȚI PRINCIPALE:
 * • Lista conversațiilor cu actualizare în timp real via Firebase
 * • Chat individual cu suport pentru mesaje text și imagini
 * • Scroll automat la ultimul mesaj cu tranziții smooth
 * • Marcarea automată a mesajelor ca citite
 * • Interfață responsivă (mobile, tablet, desktop)
 * • Lightbox pentru vizualizarea imaginilor în mărime completă
 * • Integrare cu Cloudinary pentru stocarea imaginilor
 * 
 * ARHITECTURA TEHNICĂ:
 * • Vue 3 Composition API pentru reactivitate
 * • Firebase Firestore pentru baza de date real-time
 * • Pinia pentru managementul stării globale
 * • Cloudinary pentru upload și optimizarea imaginilor
 * • CSS Grid/Flexbox pentru layout responsiv
 * 
 * INTEGRĂRI:
 * • Firebase Authentication pentru autentificare
 * • Firebase Firestore pentru stocarea conversațiilor și mesajelor
 * • Cloudinary pentru managementul imaginilor
 * • Vue Router pentru navigarea între pagini
 * • Pinia Store pentru sincronizarea datelor globale
 * 
 * =====================================================================================
 */

import { ref, computed, nextTick, onMounted, watch, onUnmounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useMessagesStore } from '@/stores/messagesStore'
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, orderBy, onSnapshot, getDoc, writeBatch, getDocs, where } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import { getAuth, onAuthStateChanged } from 'firebase/auth'
import { onSnapshot as onDocSnapshot } from 'firebase/firestore'
import axios from 'axios'

// =====================================================================================
// CONFIGURAȚII EXTERNE
// =====================================================================================
const CLOUD_NAME = 'dsexoi1zt'
const UPLOAD_PRESET = 'CraftyRo'

// =====================================================================================
// DEPENDINȚE ȘI STORE-URI
// =====================================================================================
const messagesStore = useMessagesStore()
const route = useRoute()
const router = useRouter()

// =====================================================================================
// STAREA PRINCIPALĂ A COMPONENTEI
// =====================================================================================
const currentUser = ref(null)
const selectedConversation = ref(null)
const enrichedConversations = ref([])
const messages = ref([])
const otherUser = ref(null)
const content = ref('')
const loading = ref(true)
const sending = ref(false)
const isTransitioning = ref(false)
let chatUnsub = null
let convoUnsub = null

// =====================================================================================
// STAREA INTERFEȚEI UTILIZATOR
// =====================================================================================
const chatRef = ref(null)
const listContainerRef = ref(null)
const isScrolledFromTop = ref(false)
const isScrolledToEnd = ref(true)
const isMobile = ref(window.innerWidth < 640)
const isTablet = ref(window.innerWidth >= 640 && window.innerWidth < 1280)
const isListTemporarilyExpanded = ref(false)
const listExpansionTimeout = ref(null)
const isChatScrolledFromTop = ref(false)
const isChatScrolledToEnd = ref(true)
const isLightboxOpen = ref(false)
const lightboxImageUrl = ref('')
const fileInputRef = ref(null)
const selectedImageFile = ref(null)
const imagePreviewUrl = ref(null)

// =====================================================================================
// PROPRIETĂȚI CALCULATE
// =====================================================================================

/**
 * Calculează stilul dinamic pentru lista de conversații pe diferite dispozitive
 */
const listStyle = computed(() => {
  if (isMobile.value || !selectedConversation.value) return {}
  if (!isTablet.value) return { width: '420px' }
  if (isListTemporarilyExpanded.value) return { width: '420px' }
  return { width: 'clamp(240px, calc(28.125vw + 60px), 420px)' }
})

/**
 * Procesează mesajele pentru a adăuga separatoare de dată
 */
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

/**
 * Referință la conversațiile din store
 */
const rawConversations = computed(() => messagesStore.conversations)

/**
 * Calculează ID-ul celuilalt utilizator din conversație
 */
const otherUserId = computed(() => {
  if (!selectedConversation.value || !currentUser.value) return null
  return selectedConversation.value.members.find(uid => uid !== currentUser.value.uid)
})

// =====================================================================================
// OBSERVATORI DE STARE (WATCHERS)
// =====================================================================================

/**
 * Observă conversațiile și le îmbogățește cu detalii despre produse
 */
watch(rawConversations, async (newConvs) => {
  if (newConvs && newConvs.length > 0) {
    const productIds = [...new Set(newConvs.map(c => c.productId).filter(Boolean))]
    let productDetailsMap = new Map()

    if (productIds.length > 0) {
      const productsQuery = query(collection(db, 'products'), where('__name__', 'in', productIds))
      const productsSnap = await getDocs(productsQuery)
      productsSnap.forEach(doc => {
        const data = doc.data()
        productDetailsMap.set(doc.id, {
          productTitle: data.name,
          productImage: data.images && data.images.length > 0 ? data.images[0] : null
        })
      })
    }

    enrichedConversations.value = newConvs.map(conv => {
      const productDetails = productDetailsMap.get(conv.productId) || {}
      return { ...conv, ...productDetails }
    })

    if (currentUser.value) {
      selectConversationByQuery()
    }
    
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
}, { deep: true });

/**
 * Observă încărcarea mesajelor și gestionează scroll-ul automat
 */
watch(
  [messages, selectedConversation, loading, isTransitioning],
  async ([msgs, conv, isLoading, transitioning]) => {
    console.log('Observator mesaje declanșat:', { 
      numarMesaje: msgs?.length || 0, 
      idConversatie: conv?.id, 
      seIncarca: isLoading, 
      inTranzitie: transitioning 
    })
    
    if (conv && !isLoading && msgs.length > 0 && transitioning) {
      console.log('Mesaje încărcate în timpul tranziției, se oprește tranziția și se derulează...')
      isTransitioning.value = false
      
      await nextTick()
      if (chatRef.value) {
        chatRef.value.scrollTop = chatRef.value.scrollHeight
        console.log('Derulare după oprirea tranziției:', chatRef.value.scrollTop, 'din', chatRef.value.scrollHeight)
      }
      return
    }
    
    if (conv && !isLoading && !transitioning && msgs.length > 0) {
      console.log('Observator declanșat - mesaje încărcate, se derulează...')
      
      await nextTick()
      if (chatRef.value) {
        chatRef.value.scrollTop = chatRef.value.scrollHeight
        console.log('Derulare din observator:', chatRef.value.scrollTop, 'din', chatRef.value.scrollHeight)
      }
    }
  },
  { flush: 'post' }
);

/**
 * Observă schimbarea conversației selectate
 */
watch(() => selectedConversation.value?.id, (newId, oldId) => {
  console.log('ID conversație schimbat:', { idVechi: oldId, idNou: newId, areUtilizatorCurent: !!currentUser.value })
  
  if (oldId && convoUnsub) {
    console.log('Dezabonare de la conversația veche:', oldId)
    convoUnsub()
    convoUnsub = null
  }
  if (newId && currentUser.value) {
    console.log('Abonare la conversația nouă:', newId)
    fetchOtherUser()
    subscribeToMessages()
    subscribeToConversation()
  } else if (newId && !currentUser.value) {
    console.log('Conversație selectată dar utilizatorul curent nu este încă disponibil...')
  }
}, { immediate: true })

/**
 * Observă schimbarea utilizatorului curent
 */
watch(currentUser, (user) => {
  if (user) {
    console.log('Utilizator curent schimbat:', user.uid)
    messagesStore.clearStore()
    const wasConversationSelected = selectedConversation.value?.id
    selectedConversation.value = null
    enrichedConversations.value = []
    messages.value = []
    otherUser.value = null
    messagesStore.fetchConversations(user.uid)
    
    console.log('Utilizator setat, conversație anterioară selectată?', wasConversationSelected)
  }
})

/**
 * Observă parametrii URL pentru selecția automată a conversațiilor
 */
watch(() => route.query, (newQuery) => {
  if (newQuery.sellerId && newQuery.productId && currentUser.value) {
    selectConversationByQuery();
  }
}, { immediate: true, deep: true });

/**
 * Observator combinat pentru utilizator și conversație
 */
watch(
  [currentUser, () => selectedConversation.value?.id],
  ([user, conversationId]) => {
    console.log('Observator combinat declanșat:', { idUtilizator: user?.uid, idConversatie: conversationId })
    
    if (user && conversationId) {
      console.log('Utilizator și conversație setate, se asigură abonarea...')
      fetchOtherUser()
      subscribeToMessages()
      subscribeToConversation()
    }
  }
)

// =====================================================================================
// FUNCȚII PRINCIPALE - GESTIONAREA CONVERSAȚIILOR
// =====================================================================================

/**
 * Gestionează selecția unei conversații
 */
async function handleSelectConversation(conv) {
  console.log('Funcție selectare conversație apelată pentru:', conv.id, 'curentă:', selectedConversation.value?.id)
  
  if (selectedConversation.value?.id === conv.id) {
    console.log('Aceeași conversație selectată, se derulează la final...')
    setTimeout(() => {
      scrollToBottom();
    }, 100);
    return;
  }

  console.log('Se selectează conversația nouă:', conv.id)
  
  const hadPreviousConversation = selectedConversation.value?.id
  if (hadPreviousConversation) {
    isTransitioning.value = true;
    console.log('Se setează isTransitioning = true (conversație anterioară existentă)')
  } else {
    console.log('Nu există conversație anterioară, se omite starea de tranziție')
  }
  
  messages.value = []
  otherUser.value = null
  loading.value = true
  selectedConversation.value = conv

  try {
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
  } catch (error) {
    console.error('Eroare la marcarea mesajelor ca citite:', error)
  }
}

/**
 * Selectează conversația pe baza parametrilor URL
 */
function selectConversationByQuery() {
  const { sellerId, productId } = route.query
  if (!sellerId || !productId || !currentUser.value || enrichedConversations.value.length === 0) return

  const conv = enrichedConversations.value.find(
    c => c.productId === productId && 
         c.members?.includes(sellerId) && 
         c.members?.includes(currentUser.value.uid)
  )

  if (conv) {
    handleSelectConversation(conv)
  }
}

/**
 * Obține detaliile celuilalt utilizator
 */
async function fetchOtherUser() {
  if (!otherUserId.value) return
  const userDoc = await getDoc(doc(db, 'users', otherUserId.value))
  if (userDoc.exists()) {
    otherUser.value = userDoc.data()
  } else {
    otherUser.value = null
  }
}

/**
 * Se abonează la actualizările conversației
 */
function subscribeToConversation() {
  if (!selectedConversation.value) return
  const convoRef = doc(db, 'conversations', selectedConversation.value.id)
  convoUnsub = onDocSnapshot(convoRef, (docSnap) => {
    if (docSnap.exists() && selectedConversation.value) {
      const convInList = enrichedConversations.value.find(c => c.id === selectedConversation.value.id)
      if (convInList) {
        Object.assign(convInList, docSnap.data())
      }
    }
  })
}

/**
 * Se abonează la mesajele conversației
 */
function subscribeToMessages() {
  if (!selectedConversation.value) return
  const conversationId = selectedConversation.value.id
  console.log('Abonare la mesajele conversației:', conversationId)

  const q = query(
    collection(db, 'conversations', conversationId, 'messages'),
    orderBy('timestamp')
  )
  if (chatUnsub) chatUnsub()

  chatUnsub = onSnapshot(q, async snap => {
    if (selectedConversation.value?.id !== conversationId) {
      console.log('Conversația s-a schimbat în timpul snapshot-ului, se ignoră')
      return
    }
    console.log('Mesaje actualizate din Firebase, număr:', snap.docs.length, 'pentru conversația:', conversationId)
    messages.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    loading.value = false
    
    if (isTransitioning.value) {
      console.log('Se resetează isTransitioning deoarece mesajele sunt încărcate')
      isTransitioning.value = false
    }
    
    console.log('Loading setat pe false, mesaje:', messages.value.length, 'tranziție:', isTransitioning.value)
  })
}

// =====================================================================================
// FUNCȚII PRINCIPALE - TRIMITEREA MESAJELOR
// =====================================================================================

/**
 * Trimite un mesaj nou
 */
async function send() {
  if (!content.value.trim() && !selectedImageFile.value) return
  sending.value = true
  
  let convId = selectedConversation.value?.id

  if (!convId && route.query.sellerId && currentUser.value && route.query.productId) {
    const members = [currentUser.value.uid, route.query.sellerId];
    const existingConversationsQuery = query(
      collection(db, 'conversations'),
      where('members', 'array-contains', members[0]),
      where('members', 'array-contains', members[1]),
      where('productId', '==', route.query.productId)
    );
    const existingConversationsSnap = await getDocs(existingConversationsQuery);
    
    let foundExisting = false;
    existingConversationsSnap.forEach(docSnap => {
      const data = docSnap.data();
      if (data.members.includes(members[0]) && data.members.includes(members[1]) && data.members.length === 2) {
          convId = docSnap.id;
          foundExisting = true;
      }
    });

    if (!foundExisting) {
      const newConversationRef = await addDoc(collection(db, 'conversations'), {
        members: members,
        productId: route.query.productId,
        createdAt: serverTimestamp(),
        lastUpdated: serverTimestamp(),
        lastMessage: '',
        lastMessageSenderId: '',
        lastMessageRead: false
      });
      convId = newConversationRef.id;
    }

    await messagesStore.fetchConversations(currentUser.value.uid);
    const newlySelectedConv = enrichedConversations.value.find(c => c.id === convId);
    if (newlySelectedConv) {
      handleSelectConversation(newlySelectedConv);
    } else {
      console.error('Nu s-a putut găsi sau crea conversația pentru trimiterea mesajului.');
      sending.value = false;
      return;
    }
  } else if (!convId) {
    console.error('Nu se poate trimite mesajul: Nicio conversație selectată și parametrii insuficienți pentru a crea una.');
    sending.value = false;
    return;
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
    
    setTimeout(() => {
      scrollToBottom();
    }, 100);
  } catch (error) {
    console.error("Eroare la trimiterea mesajului:", error)
    alert("Nu s-a putut trimite mesajul.")
  } finally {
    sending.value = false
  }
}

// =====================================================================================
// FUNCȚII PENTRU GESTIONAREA IMAGINILOR
// =====================================================================================

/**
 * Încarcă imaginea pe Cloudinary
 */
async function uploadImageToCloudinary(file) {
  const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`
  const formData = new FormData()
  formData.append('file', file)
  formData.append('upload_preset', UPLOAD_PRESET)
  const response = await axios.post(url, formData)
  return response.data.secure_url
}

/**
 * Deschide selectorul de fișiere
 */
function triggerFileInput() {
  fileInputRef.value.click()
}

/**
 * Gestionează selecția imaginii
 */
function handleImageSelection(event) {
  const file = event.target.files[0]
  if (!file) return
  if (file.size > 5 * 1024 * 1024) {
    alert('Imaginea trebuie să fie sub 5MB.')
    return
  }
  selectedImageFile.value = file
  imagePreviewUrl.value = URL.createObjectURL(file)
  event.target.value = ''
}

/**
 * Elimină imaginea selectată
 */
function removeSelectedImage() {
  selectedImageFile.value = null
  if (imagePreviewUrl.value) {
    URL.revokeObjectURL(imagePreviewUrl.value)
    imagePreviewUrl.value = null
  }
}

/**
 * Optimizează URL-ul imaginii pentru Cloudinary
 */
function getOptimizedImageUrl(url) {
  if (!url || !url.includes('cloudinary.com')) {
    return url
  }
  return url.replace('/upload/', '/upload/w_800,q_auto,f_auto/')
}

// =====================================================================================
// FUNCȚII PENTRU LIGHTBOX
// =====================================================================================

/**
 * Deschide lightbox-ul pentru imagine
 */
function openLightbox(imageUrl) {
  lightboxImageUrl.value = imageUrl
  isLightboxOpen.value = true
  history.pushState({ lightbox: true }, '')
}

/**
 * Închide lightbox-ul
 */
function closeLightbox() {
  isLightboxOpen.value = false
  if (history.state && history.state.lightbox) {
    history.back()
  }
}

/**
 * Gestionează butonul back din browser
 */
function handlePopState() {
  if (isLightboxOpen.value) {
    closeLightbox()
  }
}

// =====================================================================================
// FUNCȚII HELPER ȘI UTILITARE UI
// =====================================================================================

/**
 * Formatează data pentru separatoarele din chat
 */
function formatDateSeparator(date) {
  const today = new Date()
  const yesterday = new Date(today)
  yesterday.setDate(yesterday.getDate() - 1)

  if (date.toDateString() === today.toDateString()) return 'Astăzi'
  if (date.toDateString() === yesterday.toDateString()) return 'Ieri'
  return date.toLocaleDateString('ro-RO', { day: 'numeric', month: 'long', year: 'numeric' })
}

/**
 * Formatează ultimul mesaj pentru lista de conversații
 */
function getLastMessage(conv) {
  if (!conv.lastMessage) return ''
  const prefix = conv.lastMessageSenderId === currentUser.value?.uid ? 'Tu: ' : ''
  return prefix + conv.lastMessage
}

/**
 * Formatează timpul mesajului
 */
function formatTime(ts) {
  if (!ts) return ''
  const date = ts.seconds ? new Date(ts.seconds * 1000) : new Date()
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

/**
 * Returnează statusul mesajului
 */
function messageStatus(msg) {
  return msg.read ? 'Citit' : 'Trimis'
}

/**
 * Gestionează redimensionarea ferestrei
 */
const onResize = () => {
  const width = window.innerWidth
  isMobile.value = width < 640
  isTablet.value = width >= 640 && width < 1280
}

/**
 * Gestionează scroll-ul în chat
 */
function handleChatScroll() {
  if (!chatRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = chatRef.value
  const threshold = 10
  isChatScrolledFromTop.value = scrollTop > threshold
  isChatScrolledToEnd.value = (scrollTop + clientHeight) >= (scrollHeight - threshold)
}

/**
 * Actualizează starea scroll-ului pentru listă
 */
function updateScrollState() {
  if (!listContainerRef.value) return
  const { scrollTop, scrollHeight, clientHeight } = listContainerRef.value
  const threshold = 5
  isScrolledFromTop.value = scrollTop > threshold
  isScrolledToEnd.value = (scrollTop + clientHeight) >= (scrollHeight - threshold)
}

/**
 * Gestionează scroll-ul listei și expansiunea temporară
 */
function handleListScroll() {
  if (isTablet.value && selectedConversation.value) {
    if (listExpansionTimeout.value) clearTimeout(listExpansionTimeout.value)
    isListTemporarilyExpanded.value = true
    listExpansionTimeout.value = setTimeout(() => {
      isListTemporarilyExpanded.value = false
    }, 5000)
  }
  updateScrollState()
}

/**
 * Anulează expansiunea temporară a listei
 */
function revertListExpansion() {
  if (isListTemporarilyExpanded.value) {
    isListTemporarilyExpanded.value = false
    if (listExpansionTimeout.value) clearTimeout(listExpansionTimeout.value)
  }
}

/**
 * Navighează la profilul utilizatorului
 */
function goToUserProfile(userId) {
  if (userId) router.push({ name: 'user-profile', params: { id: userId } })
}

/**
 * Navighează la pagina produsului
 */
function goToProductPage(productId) {
  if (productId) {
    router.push({ name: 'product-detail', params: { id: productId } });
  }
}

/**
 * Apelată după completarea tranziției
 */
function onTransitionComplete() {
  console.log('Tranziție completă, se afișează mesajele și se derulează la final...')
  
  isTransitioning.value = false;
  
  nextTick(() => {
    if (chatRef.value && messages.value.length > 0) {
      chatRef.value.scrollTop = chatRef.value.scrollHeight;
      console.log('Scroll setat după tranziție:', chatRef.value.scrollTop, 'din', chatRef.value.scrollHeight)
    }
  });
}

/**
 * Derulează chat-ul la final
 */
function scrollToBottom() {
  if (chatRef.value) {
    console.log('ScrollToBottom apelat')
    
    chatRef.value.scrollTop = chatRef.value.scrollHeight;
    
    setTimeout(() => {
      if (chatRef.value) {
        const newScrollTop = chatRef.value.scrollTop;
        const shouldBeAt = chatRef.value.scrollHeight - chatRef.value.clientHeight;
        console.log('Verificare scroll:', { newScrollTop, shouldBeAt, diferenta: Math.abs(newScrollTop - shouldBeAt) });
        
        if (Math.abs(newScrollTop - shouldBeAt) > 5) {
          console.log('Este nevoie de ajustare scroll, se încearcă din nou...');
          chatRef.value.scrollTop = chatRef.value.scrollHeight;
        }
      }
    }, 10);
  } else {
    console.warn('ScrollToBottom apelat dar chatRef este null');
  }
}

// =====================================================================================
// CICLURI DE VIAȚĂ
// =====================================================================================

onMounted(() => {
  window.addEventListener('resize', onResize)
  window.addEventListener('popstate', handlePopState)
  
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
    if (user && route.query.sellerId && route.query.productId) {
      setTimeout(() => {
         selectConversationByQuery();
      }, 500);
    }
  })
  nextTick(() => {
    updateScrollState()
    handleChatScroll()
  })
})

onUnmounted(() => {
  if (chatUnsub) chatUnsub()
  if (convoUnsub) convoUnsub()
  window.removeEventListener('resize', onResize)
  window.removeEventListener('popstate', handlePopState)
})
</script>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.hide-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none;
}

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

.text-fade {
  mask-image: linear-gradient(to right, black 85%, transparent 100%);
  -webkit-mask-image: linear-gradient(to right, black 85%, transparent 100%);
}

.chat-scroll-container {
  scrollbar-width: thin;
  scrollbar-color: #d4a373 transparent;
}

.chat-scroll-container::-webkit-scrollbar {
  width: 8px;
  background-color: transparent;
}

.chat-scroll-container::-webkit-scrollbar-thumb {
  background-color: #d4a373;
  border-radius: 10px;
}

.chat-scroll-container::-webkit-scrollbar-thumb:hover {
  background-color: #b5838d;
}
</style>
