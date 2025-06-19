<script setup>
import LogInCard from '/src/components/LogInCard.vue'
import WelcomeBack from '/src/components/WelcomeBack.vue'
</script>

<template>
  <section class="mt-14">
    <div class="py-8 px-4 mx-auto max-w-screen-xl lg:py-16 grid lg:grid-cols-2 gap-8 lg:gap-16 items-center">
      <WelcomeBack />
      <LogInCard />
    </div>
  </section>
</template>
