<template>
  <div class="video-card">
    <h3 class="title">{{ video.title }}</h3>
    <div class="relative">
      <img
        v-if="!showIframe && thumbnailUrl"
        :src="thumbnailUrl"
        class="video-frame object-cover cursor-pointer"
        :alt="video.title"
        @click="showIframe = true"
        style="width:100%;height:200px;min-height:200px;max-height:200px;object-fit:cover;border-radius:8px;"
      />
      <iframe
        v-if="showIframe && embedUrl"
        :src="embedUrl"
        frameborder="0"
        allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
        allowfullscreen
        class="video-frame"
        @load="onIframeLoad"
        style="width:100%;height:200px;min-height:200px;max-height:200px;border-radius:8px;"
      ></iframe>
      <p v-else-if="showIframe && !embedUrl" class="error">Link video invalid sau necompletat.</p>
      <div
        v-if="showIframe && !iframeLoaded"
        class="absolute inset-0 flex items-center justify-center bg-white/70 dark:bg-[#583826]/70 z-20"
      >
        <svg class="animate-spin h-8 w-8 text-[#b5838d]" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
          <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
        </svg>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'VideoLearn',
  props: {
    video: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      iframeLoaded: false,
      showIframe: false
    }
  },
  computed: {
    embedUrl() {
      const id = this.getVideoId(this.video.src)
      return id ? `https://www.youtube.com/embed/${id}` : null
    },
    thumbnailUrl() {
      const id = this.getVideoId(this.video.src)
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : null
    }
  },
  methods: {
    getVideoId(url) {
      if (!url) return null;
      try {
        const urlObj = new URL(url);
        const hostname = urlObj.hostname;
        if (hostname.includes('youtu.be')) {
          return urlObj.pathname.slice(1);
        }
        if (hostname.includes('youtube.com')) {
          const v = urlObj.searchParams.get('v');
          if (v) return v;
          const paths = urlObj.pathname.split('/');
          const idx = paths.findIndex(p => ['embed', 'v', 'shorts'].includes(p));
          if (idx !== -1 && paths[idx + 1]) return paths[idx + 1];
        }
        return null;
      } catch (e) {
        return null;
      }
    },
    onIframeLoad() {
      this.iframeLoaded = true;
      this.$emit('loading', false);
    }
  }
}
</script>

<style scoped>
.video-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
  transition: transform 0.2s ease;
}

.video-card:hover {
  transform: translateY(-4px);
}

.title {
  font-weight: 600;
  font-size: 1.1rem;
  margin-bottom: 10px;
  text-align: center;
  color: #222;
}

.video-frame {
  width: 100%;
  height: 200px;
  border-radius: 8px;
  border: none;
}

.error {
  color: red;
  text-align: center;
}

/* .video-card, .title {
  transition: background-color 0.8s cubic-bezier(.4,0,.2,1), color 0.8s cubic-bezier(.4,0,.2,1);
} */
</style>
