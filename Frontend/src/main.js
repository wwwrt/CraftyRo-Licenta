import { createApp } from 'vue'
import { createPinia } from 'pinia'
import 'bootstrap-icons/font/bootstrap-icons.css'
import './assets/main.css'

import App from './App.vue'
import router from './router'

const app = createApp(App)



// Plugin pentru gestionarea autentificării
const authPlugin = {
  install(app) {
    app.config.globalProperties.$auth = {
      isLoggedIn: () => !!localStorage.getItem('token'),
      getUsername: () => {
        const token = localStorage.getItem('token')
        if (token) {
          const payload = JSON.parse(atob(token.split('.')[1]))
          return payload.username
        }
        return ''
      },
      logout: () => {
        localStorage.removeItem('token')
        router.push({ name: 'login' })
      }
    }
  }
}

app.use(createPinia())
app.use(router)
app.use(authPlugin)

app.mount('#app')
