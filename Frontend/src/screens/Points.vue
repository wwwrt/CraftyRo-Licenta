<!-- Points.vue -->
<template>
    <div
        class="tracking-in-contract flex mt-8 mb-2 text-[2rem] md:text-[3rem] lg:text-[4rem] justify-center text-center text-[#826a48] hover: font-bold ">
        Get points and get prizes!</div>
    <div
        class="tracking-in-contract flex mt-2 mb-8 text-[1rem] md:text-[2rem] lg:text-[2.5rem] justify-center text-center text-[#826a48] hover: font-bold ">
        For each 100 points, you're getting 10% OFF for CraftySupplies!</div>
    <div
        class="flex mt-20 mb-8 ms-10 text-[1rem] md:text-[1.5rem] lg:text-[2rem] justify-center text-center text-[#d4a373] hover: font-bold ">
        How can I get points?</div>

    <GetPoints />

</template>
  
<script setup>
import GetPoints from '/src/components/GetPoints.vue';
</script>
  
<style>/* Add your styles here */</style>
  