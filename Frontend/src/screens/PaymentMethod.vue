<template>
  <div class="payment-container">
    <h1 class="text-2xl font-bold mb-6 text-[#7f5539] dark:text-[#faedcd]">Alege metoda de plată</h1>
    <div class="flex flex-col gap-6 max-w-md mx-auto">
      <button
        class="payment-btn bg-[#d4a373] dark:bg-[#443429] text-white dark:text-[#faedcd] hover:bg-[#7f5539] hover:dark:bg-[#feb76a] font-bold rounded-lg shadow transition-all duration-200 ease-in-out text-lg py-4"
        @click="selectMethod('transfer')"
      >
        Transfer bancar
      </button>
      <button
        class="payment-btn bg-[#d4a373] dark:bg-[#443429] text-white dark:text-[#faedcd] hover:bg-[#7f5539] hover:dark:bg-[#feb76a] font-bold rounded-lg shadow transition-all duration-200 ease-in-out text-lg py-4"
        @click="selectMethod('ramburs')"
      >
        Plata ramburs la curier
      </button>
      <button
        class="payment-btn bg-[#f55f09] text-white font-bold rounded-lg shadow transition-all duration-200 ease-in-out text-lg py-4 hover:bg-[#7f5539]"
        @click="payWithStripe"
      >
        Card bancar (Stripe)
      </button>
    </div>
    <div v-if="selectedMethod" class="mt-8 text-center">
      <div v-if="selectedMethod === 'transfer'" class="text-[#7f5539] dark:text-[#faedcd]">
        <h2 class="text-xl font-bold mb-2">Detalii transfer bancar</h2>
        <p>IBAN: <span class="font-mono">RO49AAAA1B31007593840000</span></p>
        <p>Banca: Banca Exemplu</p>
        <p>Titular: Crafty SRL</p>
        <p class="mt-4">După efectuarea plății, trimite dovada la <a href="mailto:plati@crafty.ro" class="underline text-[#d4a373]">plati@crafty.ro</a></p>
      </div>
      <div v-else-if="selectedMethod === 'ramburs'" class="text-[#7f5539] dark:text-[#faedcd]">
        <h2 class="text-xl font-bold mb-2">Plata ramburs</h2>
        <p>Vei plăti suma comenzii direct curierului la livrare.</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { createStripeCheckoutSession } from '@/services/stripeService'

const selectedMethod = ref('')

function selectMethod(method) {
  selectedMethod.value = method
}

async function payWithStripe() {
  // Ia produsele selectate din localStorage (cum faci deja)
  const products = JSON.parse(localStorage.getItem('selectedOrderProducts') || '[]')
  if (!products.length) {
    alert('Nu ai produse selectate pentru plată!')
    return
  }
  try {
    const { url } = await createStripeCheckoutSession(products)
    window.location.href = url
  } catch (e) {
    alert('Eroare Stripe: ' + e.message)
  }
}
</script>

<style scoped>
.payment-container {
  max-width: 500px;
  margin: 40px auto;
  padding: 32px 20px;
  background: #fff;
  border-radius: 1.5rem;
  box-shadow: 0 4px 32px 0 rgba(212,163,115,0.10);
}
.dark .payment-container {
  background: #23262f;
  box-shadow: 0 4px 32px 0 rgba(68,52,41,0.25);
}
.payment-btn {
  width: 100%;
}
</style>
