<script setup lang="ts" name="ChatRoomComp">
/**自定义组件 */
import ChatItem from '@/components/chatItem/index.vue'
/**类型 */
import type { ElScrollbar } from 'element-plus'
/**自定义方法 */
import eventBus from '@/utils/eventBus'
import type { sendMsgType } from '../sendMsg/types/sendMsg'

const count = ref(0)
/**聊天页面的滚动条是否进行加载 */
const loading = ref(false)
/**聊天页面的所有信息都已经加载完毕 */
const noMore = computed(() => {
  return count.value >= 40
})
/**当滚动条加载或者已经没有新消息的时候，禁止滚动条在继续加载 */
const disabled = computed(() => loading.value || noMore.value)
/**滚动条加载时候做的事情 */
const load = (fn: () => void) => {
  loading.value = true
  setTimeout(() => {
    count.value += 2
    fn()
    loading.value = false
  }, 2000)
}

/**测试滚动条-开始 */
const handleScroll = (e: { scrollLeft: number; scrollTop: number }) => {
  if (disabled.value) {
    return
  }
  // 处理滚动事件
  if (e.scrollTop == 0) {
    load(() => scrollRef.value?.setScrollTop(30))
  }
}

const scrollRef = ref<InstanceType<typeof ElScrollbar> | null>(null)
watchEffect(() => {
  if (scrollRef.value) {
    scrollBottom(scrollRef.value)
  }
})

// 滚动条滚动到底部
const scrollBottom = (dom: InstanceType<typeof ElScrollbar>) => {
  nextTick(() => {
    dom.setScrollTop(Number(dom.wrapRef?.scrollHeight))
  })
}
/**测试滚动条-结束 */

const chatRef = ref<HTMLDivElement | null>(null)
/**添加消息到页面 */
const localMsgContent = ref<sendMsgType[]>([])
const addChat = (msg: sendMsgType) => {
  localMsgContent.value.push(msg)
  // 滚动到底部
  scrollBottom(scrollRef.value!)
}

/**sendMsg组件-点击发送消息按钮了 */
eventBus.on('clickSendMsg', (msg) => {
  addChat(msg)
})

onBeforeUnmount(() => {
  eventBus.off('clickSendMsg')
})
</script>

<template>
  <div id="chat-room-container">
    <el-scrollbar @scroll="handleScroll" ref="scrollRef">
      <p v-if="loading" class="loading">Loading...</p>
      <p v-if="noMore" class="loading">暂无更多</p>
      <div ref="chatRef">
        <!-- <div v-for="i in count" :key="i">{{ i }}</div> -->
        <div>
          <!-- todo:为了好看，记着删除 -->
          <div class="chat-item">
            <div class="avatar">
              <img
                src="https://thirdwx.qlogo.cn/mmopen/vi_32/L227JibHBiaAxYxiapWjiapRWW8DrAkPW5RnWkyshxwia7ibljiaZDEiaz1dib7kF8L1HBuhDJoT3vDNZl6SlMiaeM2N0V8ibz0Mm1PhibKzWGAYsR3iakXw/132"
                alt=""
              />
            </div>
            <div class="chat-item-box">
              <div class="user-info">
                <span>username</span>
                <span>(承德)</span>
              </div>
              <div class="chat-content">
                <div class="text">可以开始聊天啦～</div>
              </div>
            </div>
          </div>
          <ChatItem v-bind="item" v-for="item in localMsgContent" :key="item.content" />
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss" src="./styles/chatRoom.scss"></style>

<!-- todo:为了好看记着删除   -->
<style scoped lang="scss" src="../chatItem/styles/chatItem.scss"></style>
