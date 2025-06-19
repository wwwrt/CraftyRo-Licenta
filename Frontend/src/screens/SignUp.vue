<script setup>
import WelcomeFirst from '/src/components/WelcomeFirst.vue'
import WelcomeCard from '/src/components/WelcomeCard.vue'
</script>

<style></style>

<template>
  <section class="align-middle">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 grid lg:grid-cols-2 gap-8 lg:gap-16">
      <WelcomeFirst />
      <WelcomeCard />
    </div>
  </section>
</template>
