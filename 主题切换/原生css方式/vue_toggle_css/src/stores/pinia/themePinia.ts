import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useThemeStore = defineStore(
  'theme',
  () => {
    const isDark = ref<boolean>(false)

    function changeTheme(init: boolean = false) {
      if (!init) {
        isDark.value = !isDark.value
      }

      const html = document.documentElement as HTMLElement

      if (isDark.value) {
        html.setAttribute('class', 'dark')
      } else {
        html.setAttribute('class', 'primary')
      }
    }

    function initTheme() {
      changeTheme(true)
    }

    return {
      isDark,
      changeTheme,
      initTheme,
    }
  },
  {
    persist: {
      key: 'theme',
      storage: localStorage,
    },
  },
)
