<script setup lang="ts" name="AsideCardComp">
import { getChatroomUser } from '@/api/chatroomApi'
import { friendList } from '@/api/friendApi'
import type { IUserInfo } from '@/api/userApi'
import AvatarName from '@/components/avatarName/index.vue'
import UserContextMenu from '@/components/userContextMenu/index.vue'
import { socketKey } from '@/plugins/socket.io'
import { useUserStore } from '@/stores/user'
import eventBus from '@/utils/eventBus'
import { storeToRefs } from 'pinia'

const socket = inject(socketKey)
const { isLogin } = storeToRefs(useUserStore())
interface contextItemOptionsInter {
  label: string
  handler: () => void
}
const props = withDefaults(
  defineProps<{
    isQun: boolean
  }>(),
  {
    isQun: false
  }
)

// 好友列表
const friendlist = ref<IUserInfo[]>([])
const roomList = ref<IUserInfo[]>([])

// 获取好友的请求
async function getFriendList() {
  const res = await friendList()
  friendlist.value = res
}

// 获取群好友
async function chatroomUser(roomId: number) {
  const res = await getChatroomUser({ chatroomId: roomId })
  roomList.value = res
}

eventBus.on('chatroomUserRequest', (roomId) => {
  if (props.isQun && roomId) {
    chatroomUser(roomId)
  }
})

onMounted(() => {
  if (props.isQun) {
    socket?.on('userRegister', () => {
      chatroomUser(1)
    })
  }
})

// 登陆成功刷新
watchEffect(() => {
  if (isLogin.value && !props.isQun) {
    getFriendList()
  }
})

eventBus.on('handleFriendRequest', (isAdd) => {
  if (isAdd) {
    getFriendList()
  }
})

const listData = computed(() => {
  if (props.isQun) {
    return roomList.value
  }
  return friendlist.value
})

const roomTitle = computed(() => {
  if (props.isQun) {
    return `群友人数:${roomList.value.length}`
  }
  return '我的好友'
})

const userContextMenuVisable = ref(false)
const currentUserInfo = ref<IUserInfo>()
// 弹出定位
const menuOptions = ref({ x: 0, y: 0 })
const handleRightClick = (event: PointerEvent, item: IUserInfo) => {
  event.preventDefault()
  const { x, y } = event
  menuOptions.value.x = x
  menuOptions.value.y = y
  currentUserInfo.value = item
  userContextMenuVisable.value = true
}
</script>

<template>
  <div class="aside-card-container">
    <header class="header">
      <span class="online">{{ roomTitle }}</span>
    </header>
    <div class="online-detail">
      <el-scrollbar>
        <!-- v-infinite-scroll="load" :infinite-scroll-disabled="disabled" -->
        <div>
          <!-- :class="'outline-item'" -->
          <AvatarName
            v-for="item in listData"
            :key="item.id"
            :nickname="item.nickName || item.username"
            :avatar-url="item.headPic"
            @contextmenu.prevent.stop="handleRightClick($event, item)"
          />
        </div>
        <!-- <p v-if="loading" class="loading">Loading...</p> -->
        <p v-if="!listData.length" class="loading">暂无更多</p>
      </el-scrollbar>

      <UserContextMenu
        v-model:show="userContextMenuVisable"
        :menuOptions="menuOptions"
        :currentUserInfo="currentUserInfo"
        :context-item-options="$attrs['context-item-options'] as contextItemOptionsInter[]"
      />
    </div>
  </div>
</template>

<style scoped lang="scss" src="./style/index.scss"></style>
