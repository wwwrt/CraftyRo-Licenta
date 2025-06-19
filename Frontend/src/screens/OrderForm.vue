<template>
  <div class="max-w-lg mx-auto bg-white rounded-2xl shadow-lg p-8 mt-8">
    <h2 class="text-2xl font-bold mb-6 text-center">Finalizează comanda</h2>
    <form @submit.prevent="submitOrder">
      <div class="mb-4">
        <label class="block font-semibold mb-1">Nume și prenume</label>
        <input v-model="name" class="w-full px-4 py-2 rounded-lg border border-[#faedcd] focus:outline-none" required />
      </div>
      <div class="mb-4">
        <label class="block font-semibold mb-1">Adresă de livrare</label>
        <input v-model="address" class="w-full px-4 py-2 rounded-lg border border-[#faedcd] focus:outline-none" required />
      </div>
      <div class="mb-4">
        <label class="block font-semibold mb-1">Telefon</label>
        <input v-model="phone" class="w-full px-4 py-2 rounded-lg border border-[#faedcd] focus:outline-none" required />
      </div>
      <button
        type="submit"
        class="w-full py-3 bg-[#d4a373] text-white font-bold rounded-lg shadow hover:bg-[#7f5539] transition"
      >Trimite comanda</button>
    </form>
  </div>
</template>
<script setup>
import { ref, onMounted } from 'vue'
import { getAuth } from 'firebase/auth'
import { useRouter } from 'vue-router'
import { db } from '@/firebaseconfig'
import { updateDoc, doc } from 'firebase/firestore'

const name = ref('')
const address = ref('')
const phone = ref('')
const router = useRouter()

onMounted(() => {
  const user = getAuth().currentUser
  if (user) name.value = user.displayName || user.email || ''
})

async function submitOrder() {
  const products = JSON.parse(localStorage.getItem('selectedOrderProducts') || '[]')
  const user = getAuth().currentUser
  for (const product of products) {
    await updateDoc(doc(db, 'users', user.uid, 'cart', product.docId), {
      status: 'pending',
      buyerName: name.value,
      address: address.value,
      phone: phone.value
    })
  }
  alert('Comanda a fost trimisă către vânzător!')
  router.push({ name: 'my-orders' })
}
</script>
