import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useUIStore = defineStore('ui', () => {
  const darkMode = ref(false)
  const language = ref('ro') // 'ro' sau 'en'

  function toggleDarkMode() {
    darkMode.value = !darkMode.value
    document.documentElement.classList.toggle('dark', darkMode.value)
  }

  function toggleLanguage() {
    language.value = language.value === 'ro' ? 'en' : 'ro'
  }

  return { darkMode, language, toggleDarkMode, toggleLanguage }
})

  