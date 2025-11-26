import { ref, watch, watchEffect } from 'vue'
import { defineStore } from 'pinia'

const media = window.matchMedia('(prefers-color-scheme: dark)')
export const useThemeStore = defineStore(
  'theme',
  () => {
    const isDark = ref<boolean>(false)
    const isOsDark = ref<boolean>(true)

    function changeTheme(init: boolean = false) {
      if (!init) {
        isDark.value = !isDark.value
        // 正常切换 则关闭系统主题
        isOsDark.value = false
      }

      const html = document.documentElement as HTMLElement

      if (isDark.value) {
        html.setAttribute('class', 'dark')
      } else {
        html.setAttribute('class', 'primary')
      }
    }

    function initTheme() {
      changeOsTheme()
    }

    function changeOsTheme() {
      isOsDark.value = true
      isDark.value = media.matches
      changeTheme(true)
    }

    watchEffect(() => {
      if (isOsDark.value) {
        media.addEventListener('change', changeOsTheme)
        console.log(media, 'media')
      } else {
        media.removeEventListener('change', changeOsTheme)
      }
    })

    return {
      isDark,
      isOsDark,
      changeTheme,
      changeOsTheme,
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
