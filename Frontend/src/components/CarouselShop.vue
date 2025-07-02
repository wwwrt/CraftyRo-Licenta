<template>
  <div
    class="carousel-root relative flex items-center justify-center w-full py-4"
    style="height: 26rem;"
    @mouseenter="stopAutoplay"
    @mouseleave="startAutoplay"
    @touchstart="stopAutoplay"
    @touchend="startAutoplay"
  >
    <!-- Afișaj pentru când nu sunt produse -->
    <div v-if="visibleSlides.length === 0" class="flex items-center justify-center h-full">
      <div class="text-center">
        <div class="text-lg text-gray-500 mb-2">Nu sunt produse disponibile</div>
        <div class="text-sm text-gray-400">Produse primite: {{ products.length }}</div>
        <div class="text-sm text-gray-400">Top products: {{ topProducts.length }}</div>
      </div>
    </div>
    
    <!-- Carousel normal când sunt produse -->
    <template v-else>
      <!-- Săgeată stânga -->
      <button
        type="button"
        class="absolute left-2 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center h-10 w-10 rounded-full bg-white/30 hover:bg-[#b5838d]/60 transition group focus:outline-none"
        @click="prevSlide"
        aria-label="Previous"
      >
        <svg class="w-4 h-4 text-[#b5838d]" fill="none" viewBox="0 0 6 10">
          <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 1 1 5l4 4"/>
        </svg>
      </button>
    <!-- Imagini carousel -->
    <template v-for="(slide, idx) in visibleSlides" :key="slide.id">
      <router-link
        v-if="slide.link"
        :to="slide.link"
        class="absolute left-1/2 top-1/2 transition-all duration-500 ease-in-out"
        :style="getSlideStyle(idx)"
        tabindex="0"
        :aria-label="slide.name"
      >
        <img
          :src="slide.images?.[0] || slide.imageURL || slide.image || '/default-product.png'"
          :alt="slide.name || 'Produs'"
          class="object-cover rounded-lg select-none shadow-xl cursor-pointer"
          draggable="false"
          style="width: 100%; height: 100%;"
          @error="$event.target.src = '/default-product.png'"
        />
        <!-- Colț stânga sus: Locul în clasament -->
        <div :class="[
          'absolute top-2 left-2 bg-white/80 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 shadow text-[#b5838d] font-bold text-sm sm:text-lg z-10 transition-opacity duration-500 ease-in-out',
          idx === 1 ? 'opacity-100' : 'opacity-0'
        ]">
          #{{ slide.position }}
        </div>
        <!-- Colț dreapta sus: Inimioară cu like-uri -->
        <div :class="[
          'absolute top-2 right-2 flex items-center bg-white/80 rounded-full px-2 py-0.5 sm:px-3 sm:py-1 shadow text-[#b5838d] font-bold text-sm sm:text-lg z-10 transition-opacity duration-500 ease-in-out',
          idx === 1 ? 'opacity-100' : 'opacity-0'
        ]">
          <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 sm:h-6 sm:w-6 mr-1" fill="#f55f09" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12Z"/>
          </svg>
          {{ slide.likedBy ? slide.likedBy.length : 0 }}
        </div>
        <!-- Jos, centrat: Titlul -->
        <div :class="[
          'absolute bottom-2 left-1/2 -translate-x-1/2 bg-white/80 rounded-xl px-2 py-1 sm:px-4 sm:py-2 shadow text-[#7f5539] font-bold text-base sm:text-xl text-center w-[90%] truncate transition-opacity duration-500 ease-in-out',
          idx === 1 ? 'opacity-100' : 'opacity-0'
        ]">
          {{ slide.name }}
        </div>
      </router-link>
    </template>
    <!-- Săgeată dreapta -->
    <button
      type="button"
      class="absolute right-2 top-1/2 -translate-y-1/2 z-30 flex items-center justify-center h-10 w-10 rounded-full bg-white/30 hover:bg-[#b5838d]/60 transition group focus:outline-none"
      @click="nextSlide"
      aria-label="Next"
    >
      <svg class="w-4 h-4 text-[#b5838d]" fill="none" viewBox="0 0 6 10">
        <path stroke="currentColor" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="m1 9 4-4-4-4"/>
      </svg>
    </button>
    </template> <!-- Închide template-ul v-else -->
  </div>
</template>

<script>
export default {
  props: {
    products: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      currentIndex: 0,
      intervalId: null,
      isMobile: false
    }
  },
  watch: {
    products: {
      handler(newProducts) {
        console.log('CarouselShop: products prop changed:', newProducts.length, newProducts)
        this.$nextTick(() => {
          console.log('CarouselShop: topProducts computed:', this.topProducts.length)
          console.log('CarouselShop: visibleSlides computed:', this.visibleSlides.length)
        })
      },
      immediate: true,
      deep: true
    }
  },
  computed: {
    topProducts() {
      // Pentru cazul în care nu vine nimic de la părinte, folosește produsele directe
      if (!this.products || this.products.length === 0) {
        console.log('No products passed to carousel')
        return []
      }
      
      // Filtrare: doar produsele din luna curentă și care NU sunt în expoziție
      const now = new Date()
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1)
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999)
      
      console.log('CarouselShop: filtering products from', firstDay, 'to', lastDay)
      
      // TEMPORAR: pentru testare, nu filtra după lună
      const productsThisMonth = this.products.filter(p => {
        if (!p || p.expo) return false // exclude expo
        // Comentez temporar filtrarea pe lună pentru testare
        // if (!p.createdAt) return false
        // const created = p.createdAt.seconds ? new Date(p.createdAt.seconds * 1000) : new Date(p.createdAt)
        // return created >= firstDay && created <= lastDay
        return true // temporar: acceptă toate produsele
      })
      
      console.log('Products after date filter:', productsThisMonth.length)
      
      // Sortează după like-uri
      productsThisMonth.sort((a, b) => (b.likedBy?.length || 0) - (a.likedBy?.length || 0))
      
      // Ia doar primele 10
      const result = productsThisMonth.slice(0, 10)
      console.log('Final topProducts in carousel:', result.length, result)
      
      return result
    },
    visibleSlides() {
      // Folosește topProducts în loc de this.products
      const validProducts = this.topProducts.filter(p => 
        p.id && (p.images?.[0] || p.imageURL || p.image)
      )
      const len = validProducts.length
      if (len === 0) return []
      const prev = (this.currentIndex - 1 + len) % len
      const next = (this.currentIndex + 1) % len
      const withLink = idx => ({
        ...validProducts[idx],
        link: `/product/${validProducts[idx].id}`,
        position: idx + 1 // pentru afișare loc
      })
      return [withLink(prev), withLink(this.currentIndex), withLink(next)]
    }
  },
  methods: {
    nextSlide() {
      const len = this.topProducts.length
      if (len > 0) {
        this.currentIndex = (this.currentIndex + 1) % len
      }
    },
    prevSlide() {
      const len = this.topProducts.length
      if (len > 0) {
        this.currentIndex = (this.currentIndex - 1 + len) % len
      }
    },
    startAutoplay() {
      if (this.intervalId) return
      this.intervalId = setInterval(() => {
        this.nextSlide()
      }, 3500)
    },
    stopAutoplay() {
      clearInterval(this.intervalId)
      this.intervalId = null
    },
    getSlideStyle(idx) {
      const isMobile = this.isMobile
      // Define base styles for each slide position: 0 (left), 1 (center), 2 (right)
      const base = [
        {
          left: isMobile ? '10%' : '25%',
          zIndex: 10,
          opacity: 0.6,
          transform: 'translate(-50%, -50%) scale(0.85)',
          filter: 'blur(1px)'
        },
        {
          left: '50%',
          zIndex: 20,
          opacity: 1,
          transform: 'translate(-50%, -50%) scale(1)',
          filter: 'none'
        },
        {
          left: isMobile ? '90%' : '75%',
          zIndex: 10,
          opacity: 0.6,
          transform: 'translate(-50%, -50%) scale(0.85)',
          filter: 'blur(1px)'
        }
      ]
      return {
        ...base[idx],
        width: idx === 1 ? (isMobile ? '11rem' : '24rem') : (isMobile ? '5.5rem' : '12rem'),
        height: idx === 1 ? (isMobile ? '11rem' : '24rem') : (isMobile ? '5.5rem' : '12rem'),
        transition: 'all 0.5s cubic-bezier(0.4,0,0.2,1)'
      }
    },
    handleResize() {
      this.isMobile = window.innerWidth < 640
    }
  },
  mounted() {
    this.handleResize()
    window.addEventListener('resize', this.handleResize)
    this.startAutoplay()
    
    console.log('CarouselShop mounted, products received:', this.products.length)
    console.log('Products data:', this.products)
    console.log('Top products computed:', this.topProducts.length)
    console.log('Visible slides computed:', this.visibleSlides.length)
    
    // DEBUG: vezi dacă ai duplicate sau lipsă
    const ids = this.products.map(p => p.id)
    const hasDuplicates = ids.length !== new Set(ids).size
    if (hasDuplicates) {
      console.warn('Ai produse cu id duplicat în carousel!')
    }
    this.products.forEach(p => {
      if (!p.imageURL && !p.images?.[0] && !p.image) {
        console.warn('Produs fără imagine:', p)
      }
      if (!p.id) {
        console.warn('Produs fără id:', p)
      }
    })
  },
  beforeUnmount() {
    this.stopAutoplay()
    window.removeEventListener('resize', this.handleResize)
  }
}
</script>

<style>
@keyframes fadeInBlur {
  from {
    opacity: 0;
    filter: blur(8px);
  }
  to {
    opacity: 0.6;
    filter: blur(1px);
  }
}

@media (max-width: 640px) {
  .carousel-root {
    height: 13rem !important;
    min-height: 0 !important;
  }
}
</style>
