<template>
  <div>
    <!-- Județ -->
    <label class="block text-gray-700 font-bold mb-2">Județ</label>
    <div class="flex items-center mb-2">
      <button
        type="button"
        @click="detectJudet"
        class="mr-2 p-1 rounded-full hover:bg-[#faedcd] focus:outline-none focus:ring-2 focus:ring-[#d4a373] transition"
        title="Detectează județul"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#d4a373" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      </button>
      <select
        v-model="selectedJudet"
        @change="onJudetChange"
        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        required
      >
        <option value="" disabled>Selectează un județ</option>
        <option v-for="judet in judete" :key="judet" :value="judet">{{ judet }}</option>
      </select>
    </div>

    <!-- Localitate -->
    <label class="block text-gray-700 font-bold mb-2 mt-4">Localitate</label>
    <div class="flex items-center mb-2">
      <button
        type="button"
        @click="detectLocalitate"
        class="mr-2 p-1 rounded-full hover:bg-[#faedcd] focus:outline-none focus:ring-2 focus:ring-[#d4a373] transition"
        title="Detectează localitatea"
      >
        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="#d4a373" class="w-6 h-6">
          <path stroke-linecap="round" stroke-linejoin="round" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
          <path stroke-linecap="round" stroke-linejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
        </svg>
      </button>
      <select
        v-model="selectedLocalitate"
        :disabled="!selectedJudet || localitati.length === 0"
        class="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring focus:border-blue-300"
        required
      >
        <option value="" disabled>Selectează o localitate</option>
        <option v-for="loc in localitati" :key="loc" :value="loc">{{ loc }}</option>
      </select>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import judete from '@/assets/judete-localitati/judete.json'

const props = defineProps({
  judet: String,
  localitate: String
})
const emit = defineEmits(['update:judet', 'update:localitate'])

const selectedJudet = ref(props.judet || '')
const selectedLocalitate = ref(props.localitate || '')
const localitati = ref([])

const loadLocalitati = async (judet) => {
  if (!judet) {
    localitati.value = []
    selectedLocalitate.value = ''
    return
  }
  try {
    const data = await import(`@/assets/judete-localitati/localitati/${judet}.json`)
    localitati.value = data.default
    if (!localitati.value.includes(selectedLocalitate.value)) {
      selectedLocalitate.value = ''
    }
  } catch (e) {
    localitati.value = []
    selectedLocalitate.value = ''
  }
}

const onJudetChange = () => {
  loadLocalitati(selectedJudet.value)
  emit('update:judet', selectedJudet.value)
}

watch(selectedLocalitate, (val) => {
  emit('update:localitate', val)
})

watch(() => props.judet, (val) => {
  selectedJudet.value = val || ''
  if (val) loadLocalitati(val)
})
watch(() => props.localitate, (val) => {
  selectedLocalitate.value = val || ''
})

watch(selectedJudet, (val) => {
  if (val) loadLocalitati(val)
})

onMounted(() => {
  if (selectedJudet.value) {
    loadLocalitati(selectedJudet.value)
  }
})

// Detectează doar județul
const detectJudet = () => {
  if (!navigator.geolocation) {
    alert('Geolocația nu este suportată de browser.');
    return
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
      const data = await response.json()
      if (data.address) {
        const judetNominatim = data.address.state || ''
        const judetGasit = judete.find(j => j.toLowerCase() === judetNominatim.toLowerCase())
        if (judetGasit) {
          selectedJudet.value = judetGasit
        } else {
          alert('Județul detectat nu există în lista de județe. Selectează manual.');
        }
      } else {
        alert('Nu am putut detecta adresa. Selectează manual.');
      }
    } catch (e) {
      alert('Eroare la detectarea locației. Încearcă din nou sau selectează manual.');
    }
  }, () => {
    alert('Nu am putut detecta locația. Permite accesul la locație și încearcă din nou.');
  })
}

// Detectează județul și localitatea
const detectLocalitate = () => {
  if (!navigator.geolocation) {
    alert('Geolocația nu este suportată de browser.');
    return
  }
  navigator.geolocation.getCurrentPosition(async (pos) => {
    const { latitude, longitude } = pos.coords
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`)
      const data = await response.json()
      if (data.address) {
        const judetNominatim = data.address.state || ''
        const localitateNominatim = data.address.town || data.address.city || data.address.village || ''
        const judetGasit = judete.find(j => j.toLowerCase() === judetNominatim.toLowerCase())
        if (judetGasit) {
          selectedJudet.value = judetGasit
          await loadLocalitati(judetGasit)
          const locGasit = localitati.value.find(loc => loc.toLowerCase() === localitateNominatim.toLowerCase())
          if (locGasit) {
            selectedLocalitate.value = locGasit
          } else {
            alert('Localitatea detectată nu există în lista pentru județul selectat. Selectează manual.');
          }
        } else {
          alert('Județul detectat nu există în lista de județe. Selectează manual.');
        }
      } else {
        alert('Nu am putut detecta adresa. Selectează manual.');
      }
    } catch (e) {
      alert('Eroare la detectarea locației. Încearcă din nou sau selectează manual.');
    }
  }, () => {
    alert('Nu am putut detecta locația. Permite accesul la locație și încearcă din nou.');
  })
}

defineExpose({
  setLocation(judet, localitate) {
    selectedJudet.value = judet
    loadLocalitati(judet).then(() => {
      if (localitati.value.includes(localitate)) {
        selectedLocalitate.value = localitate
      }
    })
  }
})
</script>
