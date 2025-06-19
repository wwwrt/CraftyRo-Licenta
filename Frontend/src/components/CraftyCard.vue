<template>
  <div
    :class="[
      'relative my-3 shadow-md rounded-3xl p-2 cursor-pointer transition-transform duration-500 ease-in-out hover:scale-105 hover:shadow-2xl card-bg',
      isProfile ? 'profile-card' : '',
      !isProfile ? 'max-w-sm min-w-[340px] mx-1' : ''
    ]"
    @click="goToDetail"
  >
    <div class="overflow-x-hidden rounded-2xl relative">
      <img
        class="h-40 rounded-2xl w-full object-cover"
        :src="product.images?.[0] || product.imageURL || 'https://via.placeholder.com/288x192?text=Imagine+Produs'"
        :alt="product.name"
      />
      <!-- Butonul de ștergere produsului, vizibil doar owner-ului -->
      <button
        v-if="isOwner"
        @click.stop="$emit('delete-product', product.id)"
        class="absolute right-2 top-2 edit-btn transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full shadow-md z-20"
        title="Șterge produs"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="2" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
      <button
        v-if="isOwner"
        @click.stop="editProduct"
        class="absolute left-2 top-2 edit-btn transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full shadow-md"
        title="Editează produs"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.832 19.82a4.5 4.5 0 0 1-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 0 1 1.13-1.897L16.863 4.487Zm0 0L19.5 7.125" />
        </svg>
      </button>
      <!-- Butonul de adăugare în coș apare doar dacă NU ești owner și produsul nu e expo -->
      <button
        v-if="!isOwner && !props.expo"
        class="absolute right-2 top-2 buy-btn rounded-full p-2 shadow-md transition-colors duration-200"
        @click.stop="emit('buy-product', props.product)"
        title="Cumpără"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
        </svg>
      </button>
      <!-- Buton repunere la vânzare -->
      <button
        v-if="isOwner && props.expo"
        class="absolute right-2 top-2 edit-btn transition-colors duration-200 w-8 h-8 flex items-center justify-center rounded-full shadow-md z-20"
        @click.stop="confirmUndoExpo"
        title="Repunere la vânzare"
      >
        <!-- Săgeată curbă custom -->
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-5 h-5">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 15 3 9m0 0 6-6M3 9h12a6 6 0 0 1 0 12h-3" />
        </svg>
      </button>
    </div>
    <div class="mt-4 pl-2 mb-2 flex justify-between items-end">
      <div>
        <p class="text-lg font-semibold mb-0 card-title" :title="product.name">
          {{ product.name }}
        </p>
        <p class="text-md mt-0 card-title">{{ product.price }} lei</p>
        <p class="text-xs mt-1 card-title">In stock: {{ product.stock }}</p>
      </div>
      <div class="flex flex-col-reverse mb-1 mr-2 group cursor-pointer items-center">
        <!-- Butonul de like apare mereu, dar e dezactivat dacă ești owner -->
        <button
          :disabled="isOwner"
          @click.stop="!isOwner && toggleLike()"
          class="transition-all duration-200 ease-in-out heart-btn"
          @mouseenter="heartHover = true"
          @mouseleave="heartHover = false"
          :title="isOwner ? 'Nu poți aprecia propriul produs' : (isLiked ? 'Remove from favorites' : 'Add to favorites')"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            class="h-7 w-7"
            :fill="isDark ? (isLiked || heartHover ? '#f55f09' : '#fef3ec') : (isLiked || heartHover ? '#f55f09' : '#fff')"
            viewBox="0 0 24 24"
            stroke-width="0"
            :style="!isDark
              ? 'filter: drop-shadow(0 2px 6px rgba(0,0,0,0.15)); transition: filter 0.25s cubic-bezier(0.4,0,0.2,1), fill 0.25s cubic-bezier(0.4,0,0.2,1);'
              : 'transition: fill 0.25s cubic-bezier(0.4,0,0.2,1); filter:none;'"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"
            />
          </svg>
        </button>
        <p class="text-xs mt-1 card-title">
          {{ product.likedBy ? product.likedBy.length : 0 }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { getAuth } from 'firebase/auth'
import { useRouter } from 'vue-router'


const props = defineProps({
  product: { type: Object, required: true },
  isProfile: {
    type: Boolean,
    default: false
  },
  expo: { type: Boolean, default: false }
})

const emit = defineEmits(['like', 'buy-product', 'edit-product', 'undo-expo'])

const auth = getAuth()
const user = auth.currentUser
const router = useRouter()


const isOwner = computed(() => {
  return user && props.product.userId && props.product.userId === user.uid
})

const isLiked = computed(() => {
  if (!user || !props.product.likedBy) return false
  return props.product.likedBy.includes(user.uid)
})

const heartHover = ref(false)

const toggleLike = async () => {
  if (!user) {
    alert('Trebuie să fii logat ca să poți adăuga la favorite!')
    return
  }
  emit('like', props.product.id, !isLiked.value)
}

const goToDetail = () => {
  router.push({ name: 'product-detail', params: { id: props.product.id } })
}

function editProduct() {
  emit('edit-product', props.product.id)
}

function confirmUndoExpo() {
  if (confirm('Ești sigur că vrei să readuci produsul pentru vânzare?')) {
    emit('undo-expo', props.product.id)
  }
}


const isDark = computed(() => document.documentElement.classList.contains('dark'))
</script>

<style scoped>
/* Restul stilurilor rămân la fel */
.card-bg {
  background: #fff !important;
  color: #583826 !important;
}
.dark .card-bg {
  background: #fff !important;    /* rămâne alb și în dark mode */
  color: #583826 !important;
}
.card-title {
  color: #583826 !important;
}
.dark .card-title {
  color: #583826 !important;      /* text maro și în dark mode */
}
.buy-btn {
  background: #fef3ec !important;
  color: #8f7f76 !important;
  border: none !important;
}
.buy-btn:hover {
  background: #f55f09 !important;
  color: #fff !important;
}
.dark .buy-btn {
  background: #583826 !important;
  color: #fef3ec !important;
}
.dark .buy-btn:hover {
  background: #f55f09 !important;
  color: #fff !important;
}
.edit-btn {
  background: #fef3ec !important;
  color: #8f7f76 !important;
  border: none !important;
  width: 2rem;
  height: 2rem;
}
.edit-btn:hover {
  background: #f55f09 !important;
  color: #fff !important;
}
.dark .edit-btn {
  background: #583826 !important;
  color: #fef3ec !important;
}
.dark .edit-btn:hover {
  background: #f55f09 !important;
  color: #fff !important;
}
.heart-btn svg {
  /* NU seta fill aici! */
  transition: fill 0.25s cubic-bezier(0.4,0,0.2,1), filter 0.25s cubic-bezier(0.4,0,0.2,1);
}
.delete-btn {
  background: #fef3ec !important;
  color: #f55f09 !important;
  border: none !important;
}
.delete-btn:hover {
  background: #f55f09 !important;
  color: #fff !important;
}
.dark .delete-btn {
  background: #583826 !important;
  color: #f55f09 !important;
}
.dark .delete-btn:hover {
  background: #f55f09 !important;
  color: #fff !important;
}
</style>
