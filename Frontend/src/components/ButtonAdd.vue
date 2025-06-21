<template>
  <button
    ref="addBtn"
    @click="goToNewProduct"
    :class="['group z-50 flex items-center justify-center gap-2 px-6 py-3 bg-[#fef3ec] text-[#b5838d] border-2 border-[#d4a373] rounded-full font-semibold shadow-lg transition-all duration-200 hover:bg-[#d4a373] hover:text-white hover:scale-105 focus:outline-none text-lg fixed left-1/2 -translate-x-1/2', { 'sticky-footer': isOverFooter }]"
    :style="btnStyle"
  >
    <svg class="w-6 h-6 transition-colors duration-200 group-hover:text-white" fill="none" stroke="currentColor"
      stroke-width="2" viewBox="0 0 24 24">
      <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
    </svg>
    Adaugă un nou anunț
  </button>
</template>

<script setup>
import { ref, onMounted, onUnmounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'

const router = useRouter()
function goToNewProduct() {
  const user = getAuth().currentUser
  if (!user) {
    router.push({ name: 'login' })
  } else {
    router.push({ name: 'new-product' })
  }
}

const addBtn = ref(null)
const isOverFooter = ref(false)
const btnBottom = ref(32) // px
let observer = null

function updateBtnPosition(entryOrNull = null) {
  const btn = addBtn.value
  const footer = document.querySelector('footer')
  if (!btn || !footer) return
  const windowHeight = window.innerHeight
  const footerRect = footer.getBoundingClientRect()
  const overlap = Math.max(0, windowHeight - footerRect.top)
  if ((entryOrNull && entryOrNull.isIntersecting) || overlap > 0) {
    isOverFooter.value = true
    btnBottom.value = overlap + 24
  } else {
    isOverFooter.value = false
    btnBottom.value = 32
  }
}

onMounted(() => {
  const footer = document.querySelector('footer')
  if (!footer) return
  observer = new window.IntersectionObserver(
    ([entry]) => updateBtnPosition(entry),
    {
      root: null,
      threshold: [0, 1],
    }
  )
  observer.observe(footer)
  window.addEventListener('scroll', updateBtnPosition, { passive: true })
  window.addEventListener('resize', updateBtnPosition)
  updateBtnPosition()
})
onUnmounted(() => {
  if (observer) observer.disconnect()
  window.removeEventListener('scroll', updateBtnPosition)
  window.removeEventListener('resize', updateBtnPosition)
})
const btnStyle = computed(() => ({
  bottom: `${btnBottom.value}px`
}))
</script>

<style scoped>
.sticky-footer {
  /* poți adăuga efect de ridicare dacă vrei */
  transition: bottom 0.3s cubic-bezier(.4,0,.2,1);
}
@media (max-width: 640px) {
  .sticky-footer {
    bottom: 16px !important;
    left: 50% !important;
    transform: translateX(-50%) !important;
    width: 90vw !important;
    max-width: 340px !important;
    font-size: 1rem !important;
    padding: 0.75rem 1rem !important;
  }
}
</style>


