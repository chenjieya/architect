import { ref } from 'vue'
import { defineStore } from 'pinia'
import type { IUserInfo } from '@/api/userApi'

export const useChatroomStore = defineStore('chatroom', () => {
  const selectChatUser = ref<IUserInfo[]>([])

  function selectChatUserFn(user: IUserInfo) {
    // 检查是否已存在
    const exists = selectChatUser.value.find((item) => item.id === user.id)
    if (!exists) {
      // ✅ 创建一个新数组，避免直接修改
      selectChatUser.value = [...selectChatUser.value, user]
    }
  }

  function removeSelectChatUserFn(userId: number) {
    // ✅ 使用 filter 创建新数组
    selectChatUser.value = selectChatUser.value.filter((item) => item.id !== userId)
  }

  function clearSelectChatUserFn() {
    selectChatUser.value = []
  }

  return {
    selectChatUser, // ✅ 直接暴露 ref，不需要 computed
    selectChatUserFn,
    removeSelectChatUserFn,
    clearSelectChatUserFn
  }
})
