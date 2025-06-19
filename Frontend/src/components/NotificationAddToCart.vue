<template>
  <div class="fixed bottom-8 right-8 z-50 bg-white border border-[#d4a373] rounded-xl shadow-lg p-6 flex flex-col items-center space-y-3">
    <div class="text-[#7f5539] font-bold text-lg mb-2">Produs adăugat în coș!</div>
    <div class="flex gap-3">
      <button @click="$emit('close')" class="px-4 py-2 rounded bg-[#d4a373] text-white font-semibold hover:bg-[#7f5539]">Continuă cumpărăturile</button>
      <button @click="$emit('gotoCart')" class="px-4 py-2 rounded bg-[#f55f09] text-white font-semibold hover:bg-[#7f5539]">Mergi spre coș</button>
    </div>
  </div>
</template>
