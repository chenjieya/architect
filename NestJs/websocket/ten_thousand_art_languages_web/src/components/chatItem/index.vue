<script setup lang="ts" name="ChatItemComp">
/**类型 */
import type { sendMsgType } from '@/components/sendMsg/types/sendMsg'
import { CHAT_HISTORY_TYPE_ENUM } from '@/enum/chat-history'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
const store = useUserStore()
const { userInfo } = storeToRefs(store)
const props = withDefaults(defineProps<sendMsgType>(), {})

const dialogVisible = ref(false)
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
        <div class="text" v-if="props.message.type === CHAT_HISTORY_TYPE_ENUM.IMAGE">
          <img
            @dblclick="() => (dialogVisible = true)"
            style="max-width: 100px; max-height: 100px"
            :src="props.message.content"
            alt="聊天图片"
          />
        </div>
        <div class="text" v-else-if="props.message.type === CHAT_HISTORY_TYPE_ENUM.FILE">
          <a :href="props.message.content" download style="color: #1d90f5">{{
            props.message.content
          }}</a>
        </div>
        <div class="text" v-else>
          {{ props.message.content }}
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible">
      <img style="width: 100%; height: 100%" :src="props.message.content" alt="聊天预览图片" />
    </el-dialog>
  </div>
</template>

<style scoped lang="scss" src="./styles/chatItem.scss"></style>
