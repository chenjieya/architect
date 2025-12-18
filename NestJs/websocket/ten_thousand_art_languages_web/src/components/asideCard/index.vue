<script setup lang="ts" name="AsideCardComp">
import { friendList } from '@/api/friendApi'
import type { IUserInfo } from '@/api/userApi'
import AvatarName from '@/components/avatarName/index.vue'
import UserContextMenu from '@/components/userContextMenu/index.vue'
import { useUserStore } from '@/stores/user'
import eventBus from '@/utils/eventBus'
import { storeToRefs } from 'pinia'

const { isLogin } = storeToRefs(useUserStore())
interface contextItemOptionsInter {
  label: string
  handler: () => void
}
const props = withDefaults(
  defineProps<{
    title: string
  }>(),
  {
    title: '我的好友'
  }
)

// 好友列表
const friendlist = ref<IUserInfo[]>([])

// 获取好友的请求
async function getFriendList() {
  const res = await friendList()
  friendlist.value = res
}

// 登陆成功刷新
watchEffect(() => {
  if (isLogin.value) {
    getFriendList()
  }
})

eventBus.on('handleFriendRequest', (isAdd) => {
  if (isAdd) {
    getFriendList()
  }
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
      <span class="online">{{ props.title }}</span>
    </header>
    <div class="online-detail">
      <el-scrollbar>
        <!-- v-infinite-scroll="load" :infinite-scroll-disabled="disabled" -->
        <div>
          <!-- :class="'outline-item'" -->
          <AvatarName
            v-for="item in friendlist"
            :key="item.id"
            :nickname="item.nickName || item.username"
            :avatar-url="item.headPic"
            @contextmenu.prevent.stop="handleRightClick($event, item)"
          />
        </div>
        <!-- <p v-if="loading" class="loading">Loading...</p> -->
        <p v-if="!friendlist.length" class="loading">暂无更多</p>
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
