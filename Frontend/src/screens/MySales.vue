<template>
  <div class="max-w-3xl mx-auto py-8">
    <h2 class="text-2xl font-bold mb-6 text-center">Vânzările tale</h2>
    <div v-if="sales.length > 0" class="space-y-6">
      <div
        v-for="sale in sales"
        :key="sale.id"
        class="cart-card flex items-center bg-white rounded-2xl shadow-lg p-4 group relative"
      >
        <!-- Detalii produs și cumpărător -->
        <div class="flex-1 ml-6 flex flex-col justify-between h-full">
          <div>
            <h2 class="text-xl font-semibold text-[#7f5539] mb-1">{{ sale.productName }}</h2>
            <p class="text-[#b5838d] mb-2">Cumpărător: {{ sale.buyerName }}</p>
            <p class="mb-2">Adresă: {{ sale.address }}</p>
            <p class="mb-2">Telefon: {{ sale.phone }}</p>
            <div v-if="sale.status === 'pending'">
              <button
                class="mt-2 px-6 py-2 bg-[#d4a373] hover:bg-[#7f5539] text-white font-bold rounded-lg shadow transition-all duration-200 ease-in-out text-base"
                @click="openFanCourier(sale)"
              >Plasează comanda prin FanCourier</button>
            </div>
            <div v-else-if="sale.status === 'waiting_awb'">
              <input
                v-model="sale.awbInput"
                placeholder="Introdu AWB"
                class="border rounded px-2 py-1 mr-2"
              />
              <button
                class="px-4 py-1 bg-[#d4a373] text-white rounded"
                @click="sendAwb(sale)"
              >Trimite AWB cumpărătorului</button>
            </div>
            <div v-else-if="sale.status === 'awb_sent'">
              <span class="text-green-600 font-bold">AWB trimis cumpărătorului</span>
              <div class="mt-2 text-yellow-700 font-bold">
                Comanda este în procesare. Așteaptă confirmarea cumpărătorului.
              </div>
            </div>
            <div v-else-if="sale.status === 'completed'">
              <span class="text-green-700 font-bold">Comanda a fost finalizată cu succes!</span>
            </div>
            <div v-else-if="sale.status === 'failed'">
              <span class="text-red-700 font-bold">Comanda nu a fost finalizată de cumpărător. Cumpărătorul poate încerca din nou.</span>
              <button
                class="absolute top-2 right-2 bg-red-500 text-white rounded-full w-8 h-8 flex items-center justify-center"
                @click="deleteOrder(sale)"
                title="Șterge comanda"
              >✕</button>
            </div>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="text-center text-[#b5838d]">Nu ai vânzări noi.</div>

    <!-- Vânzări finalizate -->
    <h2 class="text-xl font-bold mt-12 mb-4">Vânzări finalizate</h2>
    <div v-if="completedSales.length > 0">
      <div
        v-for="sale in completedSales"
        :key="sale.id"
        class="bg-green-50 border border-green-300 rounded-xl p-4 mb-4"
      >
        <div class="font-bold">{{ sale.name }}</div>
        <div>{{ sale.price }} lei</div>
        <div>Status: Finalizată</div>
      </div>
    </div>
    <div v-else class="text-[#b5838d]">Nu ai vânzări finalizate.</div>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { getAuth } from 'firebase/auth'
import { db } from '@/firebaseconfig'
import { collectionGroup, query, where, onSnapshot, updateDoc, doc, deleteDoc } from 'firebase/firestore'

const sales = ref([])
const completedSales = ref([])

onMounted(() => {
  const user = getAuth().currentUser
  if (!user) return
  const q = query(
    collectionGroup(db, 'cart'), // CAUTĂ ÎN TOATE subcolecțiile cart
    where('sellerId', '==', user.uid)
  )
  onSnapshot(q, snap => {
    const all = snap.docs.map(docu => ({
      id: docu.id,
      ...docu.data()
    }))
    sales.value = all.filter(sale =>
      !['completed', 'failed', 'removed'].includes(sale.status) &&
      sale.buyerName // doar comenzile cu detalii cumpărător
    )
    completedSales.value = all.filter(sale => sale.status === 'completed')
  })
})

async function openFanCourier(sale) {
  await updateDoc(doc(db, 'users', sale.userId, 'cart', sale.id), { status: 'waiting_awb' })
  sale.status = 'waiting_awb'
  window.open('https://www.fancourier.ro/plaseaza-comanda/#expeditor', '_blank')
}

async function sendAwb(sale) {
  if (!sale.awbInput) return alert('Introdu AWB-ul!')
  await updateDoc(doc(db, 'users', sale.userId, 'cart', sale.id), {
    awb: sale.awbInput,
    status: 'awb_sent'
  })
  sale.status = 'awb_sent'
}

async function deleteOrder(sale) {
  await deleteDoc(doc(db, 'users', sale.userId, 'cart', sale.id))
}
</script>
