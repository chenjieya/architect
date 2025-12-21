import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getUserInfo as getUserInfoApi } from '@/api/userApi'
import type { IUserInfo } from '@/api/userApi'

export const useUserStore = defineStore(
  'user',
  () => {
    const token = ref('')
    const userInfo = ref<IUserInfo>()

    const setToken = (tk: string) => {
      token.value = tk
    }

    const getToken = () => {
      return token.value
    }

    const getUserInfo = async () => {
      const res = await getUserInfoApi()
      userInfo.value = res
    }

    const setUserInfo = (user: IUserInfo) => {
      userInfo.value = user
    }

    const isLogin = computed(() => {
      return token.value || localStorage.getItem('token')
    })

    return { setToken, getToken, token, isLogin, getUserInfo, userInfo, setUserInfo }
  },
  {
    persist: true
  }
)
