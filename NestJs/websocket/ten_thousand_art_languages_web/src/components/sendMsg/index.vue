<script setup lang="ts" name="SendMsgComp">
/**类型 */
import type { ElInput } from 'element-plus'
import type { sendMsgType } from './types/sendMsg'
/**自定义组件 */
import MyIcon from '@/components/myIcon/index.vue'
/**自定义方法 */
import { emojis as enjoys } from '@/utils/constant/enjoy'
import eventBus from '@/utils/eventBus'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
const store = useUserStore()
const { userInfo } = storeToRefs(store)

/**控制语音和键盘类型 */
const isAudio = ref(false)

/**测试输入消息文本框 */
const msgRef = ref<InstanceType<typeof ElInput> | null>(null)
const input = ref('')
const visable = ref<boolean>(false)
const handleMsgInput = (msg: string) => {
  const index: number = msg.indexOf('@')
  // 说明存在@
  if (index > -1) {
    // todo 打开弹框
    visable.value = true
  } else {
    visable.value = false
  }
}

/**插入表情包 */
const enjoyVisable = ref(false)
const handleInsertEnjoy = (enjoy: string) => {
  input.value += enjoy
  enjoyVisable.value = false
  // 获取焦点
  focusMsgInput()
}

/**获取输入框的焦点 */
const focusMsgInput = () => {
  msgRef.value?.focus()
}

/**点击发送消息按钮 */
const handleSendMsg = () => {
  // 消息为空
  if (!input.value.trim()) {
    focusMsgInput()
    return
  }

  // 先添加消息在发送请求
  const currentMsg: sendMsgType = {
    from: userInfo.value?.id!,
    to: null,
    content: input.value,
    sender: {
      id: userInfo.value?.id!,
      username: userInfo.value!.username,
      nickName: userInfo.value!.nickName,
      headPic: userInfo.value!.headPic
    }
  }
  addChatMsg(currentMsg)
  // todo 发送请求

  // 清空输入框 & 聚焦
  input.value = ''
  focusMsgInput()
}

/**添加消息 */
const addChatMsg = (msg: sendMsgType) => {
  // 通知chatRoom组件，添加消息
  eventBus.emit('clickSendMsg', msg)
}

function keydownFun(e: KeyboardEvent) {
  // 回车发送消息
  if (e.keyCode === 13 || e.key === 'Enter') {
    handleSendMsg()
  }
}

onMounted(() => {
  // 监听键盘按下事件
  document.body.addEventListener('keydown', keydownFun)
})

onBeforeUnmount(() => {
  document.body.removeEventListener('keydown', keydownFun)
})
</script>

<template>
  <div id="send-msg-container">
    <div class="toggle-type-area common">
      <MyIcon name="shengboyuyinxiaoxi" v-show="!isAudio" @click="isAudio = !isAudio" />
      <MyIcon name="jianpan" size="18px" v-show="isAudio" @click="isAudio = !isAudio" />
    </div>
    <div class="text-sound-area">
      <!-- 测试输入消息文本框 -->
      <el-input
        v-model="input"
        placeholder="来呀～唠嗑呀～"
        autofocus
        ref="msgRef"
        @input="handleMsgInput"
      />
    </div>
    <div class="face-area common">
      <el-popover
        v-model:visible="enjoyVisable"
        popper-class="enjoy-popover"
        placement="top"
        :width="200"
        trigger="click"
      >
        <template #reference>
          <!-- <el-button class="m-2">Click to activate</el-button> -->
          <MyIcon name="enjoy" color="yellow" />
        </template>
        <el-scrollbar>
          <ul class="enjoy-container">
            <li v-for="(enjoy, index) in enjoys" :key="index" @click="handleInsertEnjoy(enjoy)">
              {{ enjoy }}
            </li>
          </ul>
        </el-scrollbar>
      </el-popover>
    </div>
    <div class="pic-area common">
      <MyIcon name="tupian" />
    </div>
    <div class="file-area common">
      <MyIcon name="wenjianjia-2" />
    </div>
    <div class="send-area common" @click="handleSendMsg">
      <MyIcon name="huojian" size="20px" style="padding-top: 3px" title="发送" />
    </div>
  </div>
</template>

<style scoped lang="scss" src="./styles/sendMsg.scss"></style>
<!-- el-popover表情包的弹出框 -->
<style lang="scss" src="./styles/popover.scss"></style>
