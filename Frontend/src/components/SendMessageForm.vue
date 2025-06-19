<script setup>
import { ref } from 'vue'
import { collection, addDoc, serverTimestamp, doc, updateDoc } from 'firebase/firestore'
import { db } from '@/firebaseconfig'

const props = defineProps(['conversationId', 'currentUser'])
const emit = defineEmits(['sent'])
const content = ref('')
const sending = ref(false)

async function send() {
  if (!content.value.trim()) return
  sending.value = true
  const msg = {
    senderId: props.currentUser.uid,
    content: content.value,
    timestamp: serverTimestamp(),
    read: false
  }
  await addDoc(collection(db, 'conversations', props.conversationId, 'messages'), msg)
  await updateDoc(doc(db, 'conversations', props.conversationId), {
    lastMessage: content.value,
    lastMessageSenderId: props.currentUser.uid, // <-- adaugă asta!
    lastUpdated: serverTimestamp()
  })
  content.value = ''
  sending.value = false
  emit('sent')
}
</script>

<template>
  <form @submit.prevent="send"
        class="flex gap-2 items-center w-full bg-transparent"
        style="backdrop-filter: blur(8px);">
    <textarea
      v-model="content"
      class="flex-1 rounded-full border-none px-4 py-2 resize-none focus:outline-none bg-white/80 text-[#583826] placeholder-[#b0a89f] shadow-md"
      rows="1"
      placeholder="Scrie un mesaj..."
      :disabled="sending"
      @keydown.enter.exact.prevent="send"
      style="font-family: inherit;"
    ></textarea>
    <button
      type="submit"
      class="flex items-center justify-center bg-[#583826] hover:bg-[#8f7f76] text-white rounded-full transition disabled:opacity-50 shadow-md"
      :disabled="sending || !content.trim()"
      style="width:44px; height:44px;"
      title="Trimite"
    >
      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-6 h-6 text-white">
        <path stroke-linecap="round" stroke-linejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
      </svg>
    </button>
  </form>
</template>
