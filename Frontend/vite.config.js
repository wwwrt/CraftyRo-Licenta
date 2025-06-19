import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      manifest: {
        name: 'CraftyRo',
        short_name: 'Crafty',
        start_url: '/',
        display: 'standalone',
        background_color: '#ffffff',
        theme_color: '#4DBA87',
        icons: [
          {
            src: '/img/icons/android-chrome-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: '/img/icons/android-chrome-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          }
        ]
      },
      strategies: 'generateSW',
      srcDir: 'public',
      filename: 'service-worker.js',
      workbox: {
        runtimeCaching: [
          {
            urlPattern: /^http:\/\/localhost:3000\/.*$/, // URL pattern pentru API-ul tău
            handler: 'NetworkFirst', // Poți folosi 'StaleWhileRevalidate' sau altă strategie
            options: {
              cacheName: 'api-cache',
              expiration: {
                maxEntries: 50,
                maxAgeSeconds: 7 * 24 * 60 * 60 // 1 week
              },
              networkTimeoutSeconds: 10 // Timeout pentru NetworkFirst
            }
          }
        ],
        navigateFallback: 'index.html', // Fallback pentru navigare
        navigateFallbackAllowlist: [/^\/shop/] // Allowlist pentru ruta /shop
      }
    })
  ],
  server: {
    fs: {
      allow: ['..']
    }
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  }
})
