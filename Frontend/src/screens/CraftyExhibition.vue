<template>
  <div class="max-w-5xl mx-auto py-12">
    <h1
      class="tracking-in-contract text-center font-bold mb-8 text-3xl md:text-4xl lg:text-5xl"
      :class="isDark ? 'text-white' : 'text-[#583826]'"
    >
      Ai rămas fără stoc? Inspiră comunitatea! Expune-ți creațiile aici și lasă-ți arta să vorbească pentru tine.
    </h1>
    <div v-if="loading" class="text-center text-gray-400">Se încarcă...</div>
    <div v-else-if="expoProducts.length === 0" class="text-center text-gray-400">Nu există produse în expoziție.</div>
    <div v-else class="flex flex-wrap gap-6 justify-center">
      <CraftyCard
        v-for="product in expoProducts"
        :key="product.id"
        :product="product"
        :expo="true"
        @undo-expo="handleUndoExpo"
        @edit-product="handleEditProduct"
        @like="handleLike"
      />
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, computed } from 'vue'
import { collection, getDocs, query, where, updateDoc, doc, arrayUnion, arrayRemove } from 'firebase/firestore'
import { db } from '@/firebaseconfig'
import CraftyCard from '@/components/CraftyCard.vue'
import { useRouter } from 'vue-router'
import { useUIStore } from '@/stores/uiStore'
import { getAuth } from 'firebase/auth'

const expoProducts = ref([])
const loading = ref(true)
const router = useRouter()
const ui = useUIStore()
const isDark = computed(() => ui.darkMode)

const auth = getAuth()
const user = auth.currentUser

onMounted(async () => {
  const q = query(collection(db, 'products'), where('expo', '==', true))
  const snap = await getDocs(q)
  expoProducts.value = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }))
  loading.value = false
})

async function handleUndoExpo(productId) {
  await updateDoc(doc(db, 'products', productId), { expo: false })
  expoProducts.value = expoProducts.value.filter(p => p.id !== productId)
}

function handleEditProduct(productId) {
  router.push({ name: 'update-product', params: { id: productId } })
}

// --- LIKE HANDLER ---
async function handleLike(productId, shouldLike) {
  if (!user.value) {
    alert('Trebuie să fii logat ca să poți adăuga la favorite!')
    return
  }
  const prodRef = doc(db, 'products', productId)
  if (shouldLike) {
    await updateDoc(prodRef, { likedBy: arrayUnion(user.value.uid) })
    // Update local state for instant feedback
    const prod = expoProducts.value.find(p => p.id === productId)
    if (prod && (!prod.likedBy || !prod.likedBy.includes(user.value.uid))) {
      if (!prod.likedBy) prod.likedBy = []
      prod.likedBy.push(user.value.uid)
    }
  } else {
    await updateDoc(prodRef, { likedBy: arrayRemove(user.uid) })
    const prod = expoProducts.value.find(p => p.id === productId)
    if (prod && prod.likedBy) {
      prod.likedBy = prod.likedBy.filter(uid => uid !== user.uid)
    }
  }
}
</script>

<style scoped>
@keyframes fade-in-down {
  from { opacity: 0; transform: translateY(-30px);}
  to { opacity: 1; transform: translateY(0);}
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(30px);}
  to { opacity: 1; transform: translateY(0);}
}
.animate-fade-in-down {
  animation: fade-in-down 0.7s cubic-bezier(.4,0,.2,1);
}
.animate-fade-in-up {
  animation: fade-in-up 0.7s cubic-bezier(.4,0,.2,1);
}
</style>
