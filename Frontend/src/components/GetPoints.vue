<!-- GetPoints.vue -->
<template>
    <div class="button-container">
      <button class="tracking-in-contract flex mt-2 mb-2 text-[1rem] md:text-[2rem] lg:text-[2.5rem] justify-center text-center text-[#826a48] hover: font-bold " @click="selectPoint(1)">1 point</button>
      <div class="message-container" v-if="selectedPoint === 1">
        {{ pointText[1] }}
      </div>
  
      <button  class="tracking-in-contract flex mt-2 mb-2 text-[1rem] md:text-[2rem] lg:text-[2.5rem] justify-center text-center text-[#826a48] hover: font-bold " @click="selectPoint(3)">3 points</button>
      <div class="message-container" v-if="selectedPoint === 3">
        {{ pointText[3] }}
      </div>
  
      <button  class="tracking-in-contract flex mt-2 mb-2 text-[1rem] md:text-[2rem] lg:text-[2.5rem] justify-center text-center text-[#826a48] hover: font-bold " @click="selectPoint(10)">10 points</button>
      <div class="message-container" v-if="selectedPoint === 10">
        {{ pointText[10] }}
      </div>
  
      <button  class="tracking-in-contract flex mt-2 mb-2 text-[1rem] md:text-[2rem] lg:text-[2.5rem] justify-center text-center text-[#826a48] hover: font-bold " @click="selectPoint(100)">100 points</button>
      <div class="message-container" v-if="selectedPoint === 100">
        {{ pointText[100] }}
      </div>
  
      <button class="tracking-in-contract flex mt-2 mb-2 text-[1rem] md:text-[2rem] lg:text-[2.5rem] justify-center text-center text-[#826a48] hover: font-bold " @click="selectPoint('DOUBLE')">DOUBLE Points</button>
      <div class="message-container mb-10" v-if="selectedPoint === 'DOUBLE'">
        {{ pointText['DOUBLE'] }}
      </div>
    </div>
  </template>
  
  <script>
  import { ref, watch } from 'vue';
  
  export default {
    setup() {
      const selectedPoint = ref(null);
  
      const pointText = {
        1: 'for each like',
        3: 'for each follow',
        10: 'for each purchase',
        100: 'for finishing in the top 3 at the end of the month',
        DOUBLE: 'for being VIP (DOUBLE Points for each condition mentioned above)',
      };
  
      const selectPoint = (points) => {
        selectedPoint.value = points;
      };
  
      // Adaugă un watch pentru a urmări modificările în selectedPoint
      watch(selectedPoint, (newValue, oldValue) => {
        console.log(`Selected points changed from ${oldValue} to ${newValue}`);
      });
  
      return { selectedPoint, selectPoint, pointText };
    },
  };
  </script>
  
  <style scoped>
  .button-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  
  .message-container {
    background-color: rgba(0, 0, 0, 0.5);
    color: white;
    padding: 10px;
    margin-top: 5px; /* Spațiu între buton și mesaj */
    border: 2px solid white;
    border-radius: 5px;
    z-index: 999;
  }
  </style>
  