<script setup lang="ts" name="ChatRoomComp">
/**自定义组件 */
import ChatItem from '@/components/chatItem/index.vue'
/**类型 */
import type { ElScrollbar } from 'element-plus'
/**自定义方法 */
import eventBus from '@/utils/eventBus'
import type { sendMsgType } from '../sendMsg/types/sendMsg'
import type { IChatSession } from '../asideGroup/index.vue'
import { socketKey } from '@/plugins/socket.io'
import { getHistoryList, type ICursorPagination } from '@/api/chatHistoryApi'
import { useUserStore } from '@/stores/user'
import { storeToRefs } from 'pinia'
import { debounce } from '@/utils/index'
const store = useUserStore()
const { userInfo, token } = storeToRefs(store)

const socket = inject(socketKey)!

const porps = defineProps<{ sessionInfo: IChatSession; allSessionInfo: IChatSession[] }>()

const cursorPagination = ref<ICursorPagination>({
  cursor: undefined,
  limit: 50
})

/**聊天页面的滚动条是否进行加载 */
const loading = ref(false)
/**聊天页面的所有信息都已经加载完毕 */
const hasMore = ref<boolean>(false)

/**当滚动条加载或者已经没有新消息的时候，禁止滚动条在继续加载 */
const disabled = computed(() => loading.value || !hasMore.value)
/**滚动条加载时候做的事情-分页加载历史消息记录 */
const load = async (fn: () => void) => {
  loading.value = true
  try {
    const data = await getHistoryChatRecord(cursorPagination.value.limit)
    afterRequestMsgContent.value = data.map((item) => {
      return {
        id: item.id,
        from: item.sender.id,
        to: null,
        message: {
          type: item.type,
          content: item.content
        },
        sender: {
          id: item.sender.id,
          username: item.sender.username,
          nickName: item.sender.nickName,
          headPic: item.sender.headPic
        }
      }
    })
    await nextTick()
    fn()
  } finally {
    loading.value = false
  }
}

const debounceFn = debounce(load)

/**测试滚动条-开始 */
const handleScroll = (e: { scrollLeft: number; scrollTop: number }) => {
  if (disabled.value) {
    return
  }
  // 处理滚动事件
  if (e.scrollTop == 0) {
    debounceFn(() => scrollRef.value?.setScrollTop(80 * cursorPagination.value.limit))
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

let isSocketInitialized = false

function initSocket() {
  if (isSocketInitialized) return

  // 连接socket（如果未连接）
  if (!socket?.connected) {
    socket.auth = {
      token: token.value
    }
    socket?.connect()
  }

  // 只绑定一次message事件
  socket?.on('message', (payload) => {
    console.log('收到socket消息:', payload)

    if (payload.type === 'joinRoom') {
      // addChat({
      //   from: payload.fromId,
      //   to: null,
      //   content: `欢迎用户${payload.userName.join('、')}加入房间！`
      // })
    } else {
      // 确保消息添加到当前活跃的会话
      if (payload.userId !== userInfo.value?.id) {
        localMsgContent.value.push({
          id: payload.id,
          from: payload.userId,
          to: null,
          message: {
            type: payload.message.type,
            content: payload.message.content
          },
          sender: {
            id: payload.userId,
            username: payload.username,
            nickName: payload.nickName,
            headPic: payload.headPic
          }
        })
      }
    }

    // 滚动到底部
    scrollBottom(scrollRef.value!)
  })

  // 其他事件监听...
  socket?.on('connect', async () => {
    console.log('Socket已连接')
    if (porps.sessionInfo?.id) {
      socket.emit('rejoinRooms', {
        chatroomIds: porps.allSessionInfo.map((item) => item.id) || []
      })
    }
  })

  socket?.on('disconnect', () => {
    console.log('Socket已断开')
  })

  isSocketInitialized = true
}

const chatRef = ref<HTMLDivElement | null>(null)
/**添加消息到页面 */
// 本地的历史记录包括， 首次网络请求获取过来的数据， 用户新聊天的数据， 以及一百条以前的历史数据
const localMsgContent = ref<sendMsgType[]>([])
const firstRequestMsgContent = ref<sendMsgType[]>([])
const afterRequestMsgContent = ref<sendMsgType[]>([])

// 真正展示在前端的消息记录
const realMsgContent = computed<sendMsgType[]>(() => {
  // const msgMap = new Map<string, sendMsgType>()

  return [
    ...afterRequestMsgContent.value,
    ...firstRequestMsgContent.value,
    ...localMsgContent.value
  ]
})

const addChat = (msg: sendMsgType) => {
  localMsgContent.value.push(msg)
  // 滚动到底部
  scrollBottom(scrollRef.value!)

  // 发送消息，通知其他用户
  socket?.emit('sendMessage', {
    id: msg.id,
    sendUserId: msg.from,
    chatroomId: porps.sessionInfo?.id,
    message: {
      type: msg.message.type,
      content: msg.message.content
    }
  })
}

/** 获取当前聊天室的所有聊天记录 */
async function getHistoryChatRecord(limit: number) {
  const res = await getHistoryList(
    { chatroomId: +porps.sessionInfo?.id! },
    {
      limit,
      cursor: cursorPagination.value.cursor
    }
  )

  hasMore.value = res.hasMore
  cursorPagination.value.cursor = res.nextCursor

  return res.data.reverse()
}

/**sendMsg组件-点击发送消息按钮了 */
eventBus.on('clickSendMsg', (msg) => {
  addChat(msg)
})

/** 监听会话框是否进行了切换 */
watch(
  () => porps.sessionInfo,
  async (session) => {
    if (!session) return

    initSocket()

    // 1. 获取到一百条历史记录 - 加载到本地的历史记录中
    const historyChatRecord = await getHistoryChatRecord(cursorPagination.value.limit)
    firstRequestMsgContent.value = historyChatRecord.map((item) => {
      return {
        id: item.id,
        from: item.sender.id,
        to: null,
        message: {
          type: item.type,
          content: item.content
        },
        sender: {
          id: item.sender.id,
          username: item.sender.username,
          nickName: item.sender.nickName,
          headPic: item.sender.headPic
        }
      }
    })
    localMsgContent.value = []
    afterRequestMsgContent.value = []
    // 滚动到底部
    scrollBottom(scrollRef.value!)
  },
  {
    immediate: true,
    deep: true
  }
)

onBeforeUnmount(() => {
  eventBus.off('clickSendMsg')
})
</script>

<template>
  <div id="chat-room-container">
    <el-scrollbar @scroll="handleScroll" ref="scrollRef">
      <p v-if="loading" class="loading">Loading...</p>
      <p v-if="hasMore" class="loading">暂无更多</p>
      <div ref="chatRef">
        <!-- <div v-for="i in count" :key="i">{{ i }}</div> -->
        <div>
          <!-- <div class="chat-item">
            <div class="avatar">
              <img
                src="https://thirdwx.qlogo.cn/mmopen/vi_32/L227JibHBiaAxYxiapWjiapRWW8DrAkPW5RnWkyshxwia7ibljiaZDEiaz1dib7kF8L1HBuhDJoT3vDNZl6SlMiaeM2N0V8ibz0Mm1PhibKzWGAYsR3iakXw/132"
                alt=""
              />
            </div>
            <div class="chat-item-box">
              <div class="user-info">
                <span>username</span>
                <span>(未知)</span>
              </div>
              <div class="chat-content">
                <div class="text">可以开始聊天啦～</div>
              </div>
            </div>
          </div> -->
          <ChatItem v-bind="item" v-for="item in realMsgContent" :key="item.id" />
        </div>
      </div>
    </el-scrollbar>
  </div>
</template>

<style scoped lang="scss" src="./styles/chatRoom.scss"></style>

<!-- todo:为了好看记着删除   -->
<style scoped lang="scss" src="../chatItem/styles/chatItem.scss"></style>
