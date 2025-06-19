<script setup>
import { useMessagesStore } from '@/stores/messagesStore'
import { computed } from 'vue'

const props = defineProps(['selectedConversation', 'currentUser', 'openedConversations']) // <-- adaugă openedConversations aici
const emit = defineEmits(['select'])

const messagesStore = useMessagesStore()
const conversations = computed(() => messagesStore.conversations)

function selectConversation(conv) {
  emit('select', conv)
}

function getLastMessage(conv) {
  if (!conv.lastMessage || !conv.lastMessageSenderId) return conv.lastMessage || ''
  if (conv.lastMessageSenderId === props.currentUser?.uid) { // <-- folosește props.currentUser
    return 'Tu: ' + conv.lastMessage
  }
  return conv.lastMessage
}
</script>

<template>
  <div class="overflow-y-auto h-full bg-white rounded-2xl shadow-md p-3">
    <div
      v-for="conv in conversations"
      :key="conv.id"
      @click="selectConversation(conv)"
      :class="[
        'flex items-center gap-3 px-4 py-4 cursor-pointer rounded-xl mb-2 transition-all duration-200 ease-in-out transform',
        props.selectedConversation?.id === conv.id
          ? 'bg-[#583826] text-white shadow-lg scale-105'
          : 'bg-[#fef3ec] text-[#583826] hover:shadow-lg hover:scale-105'
      ]"
      style="will-change: transform;"
    >
      <img
        :src="conv.avatar || '/default-avatar.png'"
        class="w-12 h-12 rounded-full object-cover"
        alt="avatar"
      />
      <div class="flex-1 min-w-0">
        <div :class="props.selectedConversation?.id === conv.id ? 'font-semibold text-white' : 'font-semibold text-[#583826]'" class="text-base truncate">
          {{ conv.name || 'Conversatie' }}
        </div>
        <div :class="props.selectedConversation?.id === conv.id ? 'text-xs text-white/80' : 'text-xs text-[#b5838d]'" class="truncate">
          {{ conv.productTitle }}
        </div>
        <div
          class="text-sm truncate max-w-[180px]"
          :class="[
            conv.unreadCount > 0 && (!props.selectedConversation || props.selectedConversation.id !== conv.id) && !props.openedConversations?.includes(conv.id)
              ? 'font-bold'
              : '',
            props.selectedConversation?.id === conv.id ? 'text-white' : 'text-[#583826]'
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
        :class="props.selectedConversation?.id === conv.id ? 'bg-white text-[#583826]' : 'bg-[#d4a373] text-white'"
        class="ml-2 text-xs rounded-full px-2 py-0.5">
        {{ conv.unreadCount }}
      </span>
    </div>
  </div>
</template>
