<script setup lang="ts" name="AsideGroupComp">
import { getChatroomList, type IChatroom } from '@/api/chatroomApi'
import eventBus from '@/utils/eventBus'
import { triggerClick } from '@/utils/index'
import { parseTime } from '@/utils/index'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'

export interface IChatSession extends IChatroom {
  avatarUrl: string
  isBoss: boolean
}

const store = useUserStore()
const { isLogin } = storeToRefs(store)

const chatSession = ref<IChatSession[]>()

let getChatSessionFn: () => Promise<void>

async function initGetChatSession() {
  const res = (await getChatroomList()) as IChatSession[]
  res.forEach((item) => {
    item.avatarUrl =
      'https://pic2.zhimg.com/v2-31cbe31a6a08c35ff3b8b8bae295e6fe_r.jpg?source=1940ef5c'
    if (item.name === '官方') {
      item.isBoss = true
    }
  })
  chatSession.value = res
  const selectNum = chatSession.value.length - 1 >= 0 ? chatSession.value.length - 1 : 0
  triggerClick('#aside-group-container .session', selectNum)
  nextTick(() => {
    currentSession.value = { ...chatSession.value![selectNum] }
  })
}

getChatSessionFn = initGetChatSession

watch(
  () => isLogin.value,
  (newVal) => {
    if (newVal) {
      getChatSessionFn()
    }
  },
  {
    immediate: true
  }
)

let currentSession = ref<IChatSession>()
const handleSession = (item: IChatSession) => {
  if (currentSession.value?.id === item.id) {
    return
  }
  currentSession.value = item
  eventBus.emit('clickSession', item)
}

watch(currentSession, (newVal) => {
  if (!newVal) return
  eventBus.emit('chatroomUserRequest', newVal.id)
})

onBeforeUnmount(() => {
  // eventBus.off('clickSession')
})

defineExpose({
  getChatSession: () => getChatSessionFn()
})
</script>

<template>
  <ul id="aside-group-container">
    <li
      class="session"
      v-for="item in chatSession"
      :key="item.name"
      :title="item.name"
      @click="handleSession(item)"
    >
      <img :src="item.avatarUrl" alt="群头像" />
      <span class="group-name" :class="item?.id === currentSession?.id ? 'active' : ''">{{
        !item.type ? item.showChatroomName : item.name
      }}</span>
      <!-- <span class="group-name">{{ (Math.random()*10+"").substring(2, parseInt(Math.random()*10)) }}</span> -->
      <span class="tag" v-if="item.isBoss">官方</span>
      <!-- 最新消息时间 -->
      <span class="message-time">{{ parseTime(+new Date(item.updateTime), '{m}:{i}') }}</span>
    </li>
  </ul>
</template>

<style scoped lang="scss" src="./style/asideGroup.scss"></style>
