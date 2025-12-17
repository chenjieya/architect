import { ref } from 'vue'
import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', () => {
  const token = ref('')

  const setToken = (tk: string) => {
    token.value = tk
  }

  const getToken = () => {
    return token.value
  }

  const isLogin = computed(() => {
    return token.value
  })

  return { setToken, getToken, token, isLogin }
})
