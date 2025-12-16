<script setup lang="ts" name="AsideGroupComp">
import eventBus from '@/utils/eventBus'
import type { DataType } from './types/asideGroup'
import { triggerClick } from '@/utils/index'

let data = ref<DataType[]>()

// todo
setTimeout(() => {
  data.value = [
    {
      avatarUrl: 'https://pic2.zhimg.com/v2-31cbe31a6a08c35ff3b8b8bae295e6fe_r.jpg?source=1940ef5c',
      groupName: '群名称testtesttest',
      isBoss: true
    },
    {
      avatarUrl: 'https://pic2.zhimg.com/v2-31cbe31a6a08c35ff3b8b8bae295e6fe_r.jpg?source=1940ef5c',
      groupName: '群名称testtesabcttest'
    },
    {
      avatarUrl: 'https://pic2.zhimg.com/v2-31cbe31a6a08c35ff3b8b8bae295e6fe_r.jpg?source=1940ef5c',
      groupName: '测试昵称'
    },
    {
      avatarUrl: 'https://pic2.zhimg.com/v2-31cbe31a6a08c35ff3b8b8bae295e6fe_r.jpg?source=1940ef5c',
      groupName: '群名称testtesttestbiubiu'
    },
    {
      avatarUrl: 'https://pic2.zhimg.com/v2-31cbe31a6a08c35ff3b8b8bae295e6fe_r.jpg?source=1940ef5c',
      groupName: '群名称testtesttasdasest'
    },
    {
      avatarUrl: 'https://pic2.zhimg.com/v2-31cbe31a6a08c35ff3b8b8bae295e6fe_r.jpg?source=1940ef5c',
      groupName: '群名称testtesttesttestetsetse'
    }
  ]
  triggerClick('#aside-group-container .session')
  nextTick(() => {
    currentSession.value = { ...(data.value as DataType[])[0] }
  })
}, 100)

let currentSession = ref<DataType>()
const handleSession = (item: DataType) => {
  if (currentSession.value?.groupName === item.groupName) {
    return
  }
  currentSession.value = item
  eventBus.emit('clickSession', item)
}

onBeforeUnmount(() => {
  eventBus.off('clickSession')
})
</script>

<template>
  <ul id="aside-group-container">
    <li
      class="session"
      v-for="item in data"
      :key="item.groupName"
      :title="item.groupName"
      @click="handleSession(item)"
    >
      <img :src="item.avatarUrl" alt="群头像" />
      <span
        class="group-name"
        :class="item?.groupName === currentSession?.groupName ? 'active' : ''"
        >{{ item.groupName }}</span
      >
      <!-- <span class="group-name">{{ (Math.random()*10+"").substring(2, parseInt(Math.random()*10)) }}</span> -->
      <span class="tag" v-if="item.isBoss">官方</span>
      <!-- 最新消息时间 -->
      <span class="message-time">00:00</span>
    </li>
  </ul>
</template>

<style scoped lang="scss" src="./style/asideGroup.scss"></style>
