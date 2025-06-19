<template>
  <div class="flex flex-col items-center justify-center min-h-[60vh] gap-8">
    <h1 class="text-3xl font-bold mb-8">Gestionează comenzile și vânzările</h1>
    <div class="flex gap-8 mb-8">
      <button
        class="relative px-8 py-4 bg-[#d4a373] hover:bg-[#7f5539] text-white font-bold rounded-2xl shadow text-xl transition"
        @click="goTo('orders')"
      >
        Comenzile tale
        <span v-if="ordersCount > 0"
          class="absolute -top-2 -right-2 bg-[#f55f09] text-white text-xs rounded-full px-2 py-0.5 font-bold border-2 border-white"
        >{{ ordersCount }}</span>
      </button>
      <button
        class="relative px-8 py-4 bg-[#d4a373] hover:bg-[#7f5539] text-white font-bold rounded-2xl shadow text-xl transition"
        @click="goTo('sales')"
      >
        Vânzările tale
        <span v-if="salesCount > 0"
          class="absolute -top-2 -right-2 bg-[#f55f09] text-white text-xs rounded-full px-2 py-0.5 font-bold border-2 border-white"
        >{{ salesCount }}</span>
      </button>
    </div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { getAuth } from 'firebase/auth'
import { db } from '@/firebaseconfig'
import { collection, query, where, onSnapshot } from 'firebase/firestore'

const router = useRouter()
const ordersCount = ref(0)
const salesCount = ref(0)

onMounted(() => {
  const user = getAuth().currentUser
  if (!user) return

  const qOrders = collection(db, 'users', user.uid, 'cart')
  onSnapshot(qOrders, snap => {
    ordersCount.value = snap.docs.filter(docu =>
      docu.data().status !== 'completed' && docu.data().status !== 'removed'
    ).length
  })

  // Vânzări active (nu completed/failed/removed)
  const qSales = query(
    collection(db, 'cart'),
    where('sellerId', '==', user.uid)
  )
  onSnapshot(qSales, snap => {
    salesCount.value = snap.docs.filter(docu =>
      !['completed', 'failed', 'removed'].includes(docu.data().status)
    ).length
  })
})

function goTo(tab) {
  router.push({ name: tab === 'orders' ? 'my-orders' : 'my-sales' })
}
</script>
