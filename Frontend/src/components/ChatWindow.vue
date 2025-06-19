<script setup>
import { ref, onMounted, nextTick, watch } from 'vue'
import { collection, query, orderBy, onSnapshot, doc, writeBatch, getDoc } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import MessageBubble from './MessageBubble.vue'
import SendMessageForm from './SendMessageForm.vue'

const props = defineProps(['conversation', 'currentUser'])
const emit = defineEmits(['messagesRead'])
const messages = ref([])
const loading = ref(true)
const chatRef = ref(null)
const otherUser = ref(null)


async function fetchOtherUser() {
  if (!props.conversation || !props.currentUser) return
  const otherUserId = props.conversation.members.find(uid => uid !== props.currentUser.uid)
  if (!otherUserId) return
  const userDoc = await getDoc(doc(db, 'users', otherUserId))
  if (userDoc.exists()) {
    otherUser.value = userDoc.data()
  } else {
    otherUser.value = null
  }
}

function subscribeToMessages() {
  if (!props.conversation) return
  loading.value = true
  const q = query(
    collection(db, 'conversations', props.conversation.id, 'messages'),
    orderBy('timestamp')
  )
  if (window._chatUnsub) window._chatUnsub()
  window._chatUnsub = onSnapshot(q, snap => {
    messages.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
    loading.value = false
    nextTick(() => {
      if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
    })
  })
}

// La montare:
onMounted(() => {
  subscribeToMessages()
  fetchOtherUser()
})

// La schimbarea conversației:
watch(() => props.conversation && props.conversation.id, () => {
  subscribeToMessages()
  fetchOtherUser()
})

watch(messages, async (msgs) => {
  if (!msgs.length) return
  const unread = msgs.filter(m => !m.read && m.senderId !== props.currentUser.uid)
  if (unread.length) {
    const batch = writeBatch(db)
    unread.forEach(m => {
      batch.update(doc(db, 'conversations', props.conversation.id, 'messages', m.id), { read: true })
    })
    await batch.commit()
    emit('messagesRead', unread.map(m => m.id))
  }
})
</script>

<template>
  <div class="flex flex-col h-full w-full min-h-0">
    <!-- Header -->
    <div v-if="otherUser" class="flex items-center gap-3 px-6 py-4 bg-white rounded-2xl shadow-md mb-2 flex-shrink-0">
      <img
        :src="otherUser.photoURL || '/default-avatar.png'"
        class="w-12 h-12 rounded-full object-cover border border-[#faedcd]"
        alt="avatar"
      />
      <div>
        <div class="font-semibold text-[#7f5539] text-lg">
          {{ otherUser.displayName || otherUser.name || 'Utilizator' }}
        </div>
      </div>
    </div>
    <!-- Mesaje -->
    <div
      class="flex-1 min-h-0 flex flex-col bg-white rounded-2xl shadow-md px-6 py-6 space-y-2 overflow-y-auto relative hide-scrollbar"
      ref="chatRef"
    >
      <div v-if="loading" class="text-center text-gray-400">Se încarcă...</div>
      <div v-if="!loading && messages.length === 0" class="text-center text-gray-400">Niciun mesaj.</div>
      <MessageBubble
        v-for="msg in messages"
        :key="msg.id"
        :message="msg"
        :isOwn="msg.senderId === currentUser.uid"
      />
    </div>
    <!-- Bara de typing -->
    <div class="w-full pt-2 flex-shrink-0">
      <SendMessageForm
        :conversationId="conversation.id"
        :currentUser="currentUser"
        @sent="() => nextTick(() => {
          if (chatRef.value) chatRef.value.scrollTop = chatRef.value.scrollHeight
        })"
        class="w-full"
      />
    </div>
  </div>
</template>

<style scoped>
/* Ascunde scrollbar-ul doar pe acest div */
.hide-scrollbar {
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* IE 10+ */
}
.hide-scrollbar::-webkit-scrollbar {
  display: none; /* Chrome/Safari/Webkit */
}
</style>
