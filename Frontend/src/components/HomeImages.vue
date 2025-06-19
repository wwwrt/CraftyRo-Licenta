<template>
  <div class="flex justify-center items-center">
    <img
      :src="imageSrc"
      :alt="altText"
      class="gif-img"
    />
  </div>
</template>

<script setup>
defineProps(['imageSrc', 'altText'])
</script>

<style scoped>
.gif-img {
  @apply rounded-xl;
  transition: transform 0.22s cubic-bezier(.4,0,.2,1), box-shadow 0.22s cubic-bezier(.4,0,.2,1);
  box-shadow: 0 2px 8px 0 rgba(0,0,0,0.10);
  display: block;
  max-width: 100%;
  height: auto;
}
.gif-img:hover {
  transform: scale(1.035);
  box-shadow: 0 8px 24px 0 rgba(0,0,0,0.13);
}
</style>
