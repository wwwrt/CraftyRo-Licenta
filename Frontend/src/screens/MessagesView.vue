<template>
  <div class="fixed inset-x-0 top-14 sm:top-24 h-[calc(100dvh-3.5rem)] sm:h-[calc(100dvh-6rem)] w-full overflow-hidden">
    <div class="flex flex-col items-center sm:flex-row sm:items-stretch gap-4 w-full h-full max-w-6xl mx-auto p-2 sm:p-4">
      <!-- Lista de chaturi -->
      <div
        v-show="!isMobile || !selectedConversation"
        class="flex flex-col w-full sm:w-[320px] min-w-[180px] max-w-[340px] h-full min-h-0 bg-white rounded-2xl shadow-xl overflow-hidden p-0"
      >
        <div class="flex-1 min-h-0 overflow-y-auto hide-scrollbar p-2 sm:p-3">
          <div
            v-for="conv in conversations"
            :key="conv.id"
            @click="() => handleSelectConversation(conv.id)"
            :class="[
              'flex items-center gap-3 px-4 py-4 cursor-pointer mb-2 transition-all duration-200 ease-in-out transform rounded-xl',
              selectedConversation?.id === conv.id
                ? 'bg-[#583826] text-white shadow-lg scale-105'
                : 'bg-[#fef3ec] text-[#583826] hover:shadow-lg hover:scale-105 hover:bg-[#e6ccb2]'
            ]"
            style="will-change: transform;"
          >
            <img
              :src="conv.avatar || conv.photoURL || '/default-avatar.png'"
              class="w-12 h-12 rounded-full object-cover"
              alt="avatar"
            />
            <div class="flex-1 min-w-0">
              <div :class="selectedConversation?.id === conv.id ? 'font-semibold text-white' : 'font-semibold text-[#583826]'" class="text-base truncate">
                {{ conv.name || 'Conversatie' }}
              </div>
              <div :class="selectedConversation?.id === conv.id ? 'text-xs text-white/80' : 'text-xs text-[#b5838d]'" class="truncate">
                {{ conv.productTitle }}
              </div>
              <div
                class="text-sm truncate max-w-[180px]"
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
              class="w-12 h-12 rounded-xl object-cover ml-2"
              alt="produs"
            />
            <span v-if="conv.unreadCount > 0"
              :class="selectedConversation?.id === conv.id ? 'bg-white text-[#583826]' : 'bg-[#d4a373] text-white'"
              class="ml-2 text-xs rounded-full px-2 py-0.5">
              {{ conv.unreadCount }}
            </span>
          </div>
        </div>
      </div>

      <!-- Card conversație -->
      <div
        v-show="!isMobile || selectedConversation"
        class="flex flex-col w-full max-w-[340px] sm:w-auto sm:max-w-none flex-1 min-w-0 h-full min-h-0"
      >
        <div v-if="selectedConversation" class="flex flex-col h-full min-h-0 gap-y-4">
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
              <div>
                <div class="font-semibold text-[#7f5539] text-lg cursor-pointer hover:underline"
                  @click="goToUserProfile(otherUserId)">
                  {{ otherUser.displayName || otherUser.name || 'Utilizator' }}
                </div>
              </div>
            </template>
          </div>
          <!-- Mesaje ca un card -->
          <div
            class="flex-1 min-h-0 flex flex-col bg-white rounded-2xl shadow-md px-4 py-4 space-y-2 relative hide-scrollbar overflow-y-auto"
            ref="chatRef"
          >
            <div v-if="loading" class="text-center text-gray-400">Se încarcă...</div>
            <div v-if="!loading && messages.length === 0" class="text-center text-gray-400">Niciun mesaj.</div>
            <div
              v-for="msg in messages"
              :key="msg.id"
              :class="[
                'flex w-full mb-2',
                msg.senderId === currentUser?.uid ? 'justify-end' : 'justify-start'
              ]"
            >
              <div v-if="msg.senderId === currentUser?.uid" class="flex flex-col items-end">
                <div class="px-5 py-3 rounded-2xl rounded-br-md shadow-md bg-[#583826] text-white max-w-[70vw] min-w-[48px] break-words">
                  <span>{{ msg.content }}</span>
                </div>
                <div class="text-xs mt-1" style="color: #b0a89f; font-style: italic; text-align: right;">
                  {{ formatTime(msg.timestamp) }}
                  <span>· {{ messageStatus(msg) }}</span>
                </div>
              </div>
              <div v-else class="flex flex-col items-start">
                <div class="px-5 py-3 rounded-2xl rounded-bl-md shadow-md bg-[#fef3ec] text-[#583826] max-w-[70vw] min-w-[48px] break-words">
                  <span>{{ msg.content }}</span>
                </div>
                <div class="text-xs mt-1" style="color: #b0a89f; font-style: italic; text-align: left;">
                  {{ formatTime(msg.timestamp) }}
                </div>
              </div>
            </div>
          </div>
          <!-- Bara de typing -->
          <form
            @submit.prevent="send"
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
        <div v-else-if="!isMobile" class="flex flex-1 items-center justify-center text-gray-400">
          Selectează o conversație
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, watch, onUnmounted } from 'vue'
import { useRoute } from 'vue-router'
import { useMessagesStore } from '@/stores/messagesStore'
import { collection, addDoc, serverTimestamp, doc, updateDoc, query, orderBy, onSnapshot, getDoc, writeBatch, getDocs, where, deleteDoc } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import { getAuth, onAuthStateChanged } from 'firebase/auth' // <-- importă astea
import { onSnapshot as onDocSnapshot } from 'firebase/firestore'

const messagesStore = useMessagesStore()
const selectedConversation = ref(null)
const currentUser = ref(null)
const openedConversations = ref([])
const messages = ref([])
const loading = ref(true)
const chatRef = ref(null)
const otherUser = ref(null)
const content = ref('')
const sending = ref(false)
const isMobile = ref(window.innerWidth < 640)

const route = useRoute()

const conversations = computed(() => messagesStore.conversations)
const otherUserId = computed(() => {
  if (!selectedConversation.value || !currentUser.value) return null
  return selectedConversation.value.members.find(uid => uid !== currentUser.value.uid)
})

const onResize = () => { isMobile.value = window.innerWidth < 640 }

// 1. Inițializează userul la mount
onMounted(() => {
  window.addEventListener('resize', onResize)
  const auth = getAuth()
  onAuthStateChanged(auth, (user) => {
    currentUser.value = user
  })
})

// 2. Când userul se schimbă, resetează store-ul și fetch-uiește conversațiile
watch(currentUser, (user) => {
  if (user) {
    messagesStore.clearStore()
    selectedConversation.value = null
    openedConversations.value = []
    messages.value = []
    otherUser.value = null
    messagesStore.fetchConversations(user.uid)
  }
})

// 3. Când userul și conversațiile sunt gata, selectează conversația din query (dacă există)
watch(
  [() => currentUser.value, conversations],
  ([user, convs]) => {
    if (user && convs.length) {
      selectConversationByQuery()
    }
  },
  { immediate: true }
)

let convoUnsub = null

async function handleSelectConversation(convOrId) {
  const convId = typeof convOrId === 'string' ? convOrId : convOrId.id
  // Nu face nimic dacă aceeași conversație este deja selectată
  if (selectedConversation.value?.id === convId) return

  // Caută conversația actualizată din store după id
  const conv = conversations.value.find(c => c.id === convId)
  if (!conv) return

  // Resetare stare pentru a preveni afișarea datelor vechi (FIX)
  messages.value = []
  otherUser.value = null
  loading.value = true

  selectedConversation.value = conv
  if (!openedConversations.value.includes(conv.id)) {
    openedConversations.value.push(conv.id)
  }
  subscribeToMessages()
  subscribeToConversation()
  fetchOtherUser()

  // Marchează mesajele necitite ca citite în Firebase
  const q = query(
    collection(db, 'conversations', conv.id, 'messages'),
    where('read', '==', false),
    where('senderId', '!=', currentUser.value.uid)
  )
  const snap = await getDocs(q)
  if (!snap.empty) {
    const batch = writeBatch(db)
    snap.forEach(docSnap => {
      batch.update(docSnap.ref, { read: true })
    })
    await batch.commit()
    // Actualizează și conversația cu ultimul mesaj ca fiind citit
    await updateDoc(doc(db, 'conversations', conv.id), { lastMessageRead: true })
  }
}

// Subscribe la documentul conversației pentru a asculta modificările la lastMessageRead
function subscribeToConversation() {
  if (convoUnsub) convoUnsub()
  if (!selectedConversation.value) return
  const convoRef = doc(db, 'conversations', selectedConversation.value.id)
  convoUnsub = onDocSnapshot(convoRef, (docSnap) => {
    if (docSnap.exists()) {
      // Actualizează selectedConversation cu datele noi (inclusiv lastMessageRead)
      selectedConversation.value = { ...selectedConversation.value, ...docSnap.data() }
    }
  })
}

// Dezabonare la schimbarea conversației
watch(selectedConversation, (newVal, oldVal) => {
  if (oldVal && convoUnsub) {
    convoUnsub()
    convoUnsub = null
  }
  if (newVal) {
    subscribeToConversation()
  }
})

function getLastMessage(conv) {
  if (!conv.lastMessage || !conv.lastMessageSenderId) return conv.lastMessage || ''
  if (conv.lastMessageSenderId === currentUser.value?.uid) {
    return 'Tu: ' + conv.lastMessage
  }
  return conv.lastMessage
}

async function fetchOtherUser() {
  if (!selectedConversation.value || !currentUser.value) return
  const otherUserId = selectedConversation.value.members.find(uid => uid !== currentUser.value.uid)
  if (!otherUserId) return
  const userDoc = await getDoc(doc(db, 'users', otherUserId))
  if (userDoc.exists()) {
    otherUser.value = userDoc.data()
  } else {
    otherUser.value = null
  }
}

function subscribeToMessages() {
  if (!selectedConversation.value) return
  loading.value = true
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

    // --- NOU: Marchează mesajele necitite ca citite instant când vin mesaje noi ---
    if (selectedConversation.value && currentUser.value) {
      const unread = snap.docs.filter(
        docSnap =>
          docSnap.data().read === false &&
          docSnap.data().senderId !== currentUser.value.uid
      )
      if (unread.length > 0) {
        const batch = writeBatch(db)
        unread.forEach(docSnap => {
          batch.update(docSnap.ref, { read: true })
        })
        await batch.commit()
        // Marchează și conversația ca citită
        await updateDoc(doc(db, 'conversations', selectedConversation.value.id), { lastMessageRead: true })
      }
    }
    // --- END NOU ---
  })
}

async function send() {
  if (!content.value.trim()) return
  sending.value = true

  let convId = selectedConversation.value?.id

  // Dacă nu există conversația, creeaz-o ACUM!
  if (!convId) {
    const newConvRef = await addDoc(collection(db, 'conversations'), {
      members: [currentUser.value.uid, route.query.sellerId],
      productId: route.query.productId,
      lastMessage: '',
      lastUpdated: serverTimestamp()
    })
    convId = newConvRef.id
    // Refă fetch la conversații și selectează conversația nouă
    await messagesStore.fetchConversations(currentUser.value.uid)
    const newConv = conversations.value.find(c => c.id === convId)
    selectedConversation.value = newConv
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
  nextTick(() => {
    if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
  })
}

function formatTime(ts) {
  if (!ts) return ''
  const date = ts.seconds
    ? new Date(ts.seconds * 1000)
    : new Date(ts)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

function messageStatus(msg) {
  if (!msg.read) return 'Trimis'
  return 'Citit'
}

onMounted(async () => {
  const { sellerId, productId } = route.query
  if (sellerId && productId) {
    // Caută conversația potrivită
    const conv = conversations.value.find(
      c =>
        c.productId === productId &&
        c.members &&
        c.members.includes(sellerId) &&
        c.members.includes(currentUser.value?.uid)
    )
    if (conv) {
      handleSelectConversation(conv)
    }
    // Elimină complet partea cu addDoc aici!
  }
})

function selectConversationByQuery() {
  const { sellerId, productId } = route.query
  if (!sellerId || !productId || !currentUser.value) return

  // Caută conversația potrivită
  const conv = conversations.value.find(
    c =>
      c.productId === productId &&
      c.members &&
      c.members.includes(sellerId) &&
      c.members.includes(currentUser.value.uid)
  )
  if (conv) {
    handleSelectConversation(conv)
  }
}

// Dacă conversația selectată nu are niciun mesaj, șterge-o
onUnmounted(async () => {
  if (
    selectedConversation.value &&
    selectedConversation.value.id &&
    messages.value.length === 0
  ) {
    await deleteDoc(doc(db, 'conversations', selectedConversation.value.id))
  }
  window.removeEventListener('resize', onResize)
})
</script>

<style scoped>
.hide-scrollbar {
  scrollbar-width: none;
  -ms-overflow-style: none;
}
.hide-scrollbar::-webkit-scrollbar {
  display: none !important;
}
</style>
