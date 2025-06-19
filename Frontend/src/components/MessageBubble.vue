<template>
  <div
    :class="[
      'flex w-full mb-2',
      isOwn ? 'justify-end' : 'justify-start'
    ]"
  >
    <div class="flex flex-col items-end" v-if="isOwn">
      <div
        class="px-5 py-3 rounded-2xl rounded-br-md shadow-md bg-[#583826] text-white max-w-[70vw] min-w-[48px] break-words"
      >
        <span>{{ message.content }}</span>
      </div>
      <div
        class="text-xs mt-1"
        style="color: #b0a89f; font-style: italic; text-align: right;"
      >
        {{ formatTime(message.timestamp) }}
        <span v-if="isOwn">· {{ messageStatus }}</span>
      </div>
    </div>
    <div class="flex flex-col items-start" v-else>
      <div
        class="px-5 py-3 rounded-2xl rounded-bl-md shadow-md bg-[#fef3ec] text-[#583826] max-w-[70vw] min-w-[48px] break-words"
      >
        <span>{{ message.content }}</span>
      </div>
      <div
        class="text-xs mt-1"
        style="color: #b0a89f; font-style: italic; text-align: left;"
      >
        {{ formatTime(message.timestamp) }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  message: Object,
  isOwn: Boolean
})

function formatTime(ts) {
  if (!ts) return ''
  const date = ts.seconds
    ? new Date(ts.seconds * 1000)
    : new Date(ts)
  return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
}

const messageStatus = computed(() => {
  if (!props.isOwn) return ''
  if (props.message.read) return 'seen'
  if (props.message.delivered) return 'delivered'
  return 'sent'
})
</script>
