<script setup lang="ts" name="ChatItemComp">
/**类型 */
import type { sendMsgType } from '@/components/sendMsg/types/sendMsg'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
const store = useUserStore()
const { userInfo } = storeToRefs(store)
const props = withDefaults(defineProps<sendMsgType>(), {})
</script>

<template>
  <div class="chat-item" :class="props.from === userInfo?.id ? 'chat-item-me' : ''">
    <div class="avatar">
      <img
        :src="
          props.sender.headPic ||
          'https://thirdwx.qlogo.cn/mmopen/vi_32/L227JibHBiaAxYxiapWjiapRWW8DrAkPW5RnWkyshxwia7ibljiaZDEiaz1dib7kF8L1HBuhDJoT3vDNZl6SlMiaeM2N0V8ibz0Mm1PhibKzWGAYsR3iakXw/132'
        "
        alt=""
      />
    </div>
    <div class="chat-item-box">
      <div class="user-info">
        <span>{{ props.sender.nickName || props.sender.username }}</span>
        <span>(未知)</span>
      </div>
      <div class="chat-content">
        <div class="text">{{ props.content }}</div>
      </div>
    </div>
  </div>
</template>

<style scoped lang="scss" src="./styles/chatItem.scss"></style>
