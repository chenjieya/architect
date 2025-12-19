<script setup lang="ts" name="AsideFnComp">
import CheckoutRow from '@/components/checkoutRow/index.vue'
import MyDialog from '@/components/myDialog/index.vue'
import FriendRequest from '@/components/friendRequest/index.vue'
import type { IUserInfo } from '@/api/userApi'
import { friendList, type IFriendRequest, friendRequestList } from '@/api/friendApi'
import eventBus from '@/utils/eventBus'
import { useChatroomStore } from '@/stores/chatroom'
import { storeToRefs } from 'pinia'
import { createGroupChat } from '@/api/chatroomApi'

const myGroupDialogRef = ref<InstanceType<typeof MyDialog> | null>(null)
const checkoutRef = ref<InstanceType<typeof CheckoutRow> | null>(null)
const { selectChatUser } = storeToRefs(useChatroomStore())

const instanceRef = inject<{ chatSessionRef?: { getChatSession: () => void } }>('instanceRef')

/**打开创建群组弹框 */
const handleClick = () => {
  getFriendList()
  myGroupDialogRef.value?.openMyDialog()
}

// 好友列表
const friendlist = ref<IUserInfo[]>([])

// 获取好友的请求
async function getFriendList() {
  const res = await friendList()
  friendlist.value = res
}

/**关闭弹框要做的事情-初始化 */
const handleCloseMyDialog = () => {
  const checkoutRowRefArr: any = checkoutRef.value
  for (let i = 0; i < checkoutRowRefArr?.length; i++) {
    checkoutRowRefArr[i].toggleSelection(false)
  }

  console.log('关闭弹框前的回调')
}

/**点击弹框内确定按钮要做的事情-提交表单 */
const handleSubmitMyDialog = async () => {
  console.log('提交表单')
  // 创建群聊
  await createGroupChat(selectChatUser.value.map((item) => item.id))
  ElMessage.success('群聊创建成功')

  // 刷新群聊
  instanceRef?.chatSessionRef?.getChatSession()
}

/**
 * BUG反馈
 */
const myBugDialogRef = ref<InstanceType<typeof MyDialog> | null>(null)
const bugText = ref<string>('')
const handleBugClick = () => myBugDialogRef.value?.openMyDialog()
const handleCloseMyBugDialog = () => {
  console.log('关闭弹框前的回调')
  bugText.value = ''
}
const handleSubmitMyBugDialog = () => {
  console.log('提交表单')
}

/**
 * 新的朋友
 */
const friendRequestListData = ref<IFriendRequest[]>([])
const myFriendDialogRef = ref<InstanceType<typeof MyDialog> | null>(null)
const handleFriendClick = () => {
  getFriendRequestList()
  myFriendDialogRef.value?.openMyDialog()
}
const handleCloseMyFriendDialog = () => {}
const handleSubmitMyFriendDialog = () => {}

// 获取好友申请
async function getFriendRequestList() {
  const res = await friendRequestList()
  friendRequestListData.value = res
}

eventBus.on('handleFriendRequest', () => {
  getFriendRequestList()
})

// const timer = setInterval(() => {
//   getFriendRequestList()
// }, 5000)

// onUnmounted(() => clearInterval(timer))
</script>

<template>
  <div id="aside-fn-container">
    <div class="item-project" @click="handleClick">创建群聊</div>
    <div
      :class="{ 'item-project': true, badge: friendRequestListData.length }"
      @click="handleFriendClick"
    >
      新的朋友
    </div>
    <div class="item-project">个人信息</div>
    <div class="item-project" @click="handleBugClick">BUG反馈</div>
    <!-- 创建群聊 -->
    <MyDialog
      ref="myGroupDialogRef"
      title="创建群聊"
      @closeMyDialog="handleCloseMyDialog"
      @submitMyDialog="handleSubmitMyDialog"
    >
      <p
        v-if="!friendlist.length"
        style="text-align: center; font-size: 12px; padding-bottom: 10px; padding-top: 10px"
      >
        暂无更多
      </p>
      <CheckoutRow
        v-for="item in friendlist"
        :key="item.id"
        :data="item"
        ref="checkoutRef"
        v-else
      />
    </MyDialog>
    <!-- 新的朋友 -->
    <MyDialog
      ref="myFriendDialogRef"
      title="新的朋友"
      @closeMyDialog="handleCloseMyFriendDialog"
      @submitMyDialog="handleSubmitMyFriendDialog"
    >
      <p
        v-if="!friendRequestListData.length"
        style="text-align: center; font-size: 12px; padding-bottom: 10px; padding-top: 10px"
      >
        暂无更多
      </p>
      <FriendRequest v-for="item in friendRequestListData" :data="item" :key="item.id" v-else />
    </MyDialog>
    <!-- 个人信息 -->
    <!-- BUG反馈 -->
    <MyDialog
      ref="myBugDialogRef"
      title="BUG反馈"
      @closeMyDialog="handleCloseMyBugDialog"
      @submitMyDialog="handleSubmitMyBugDialog"
    >
      <el-input v-model="bugText" :rows="4" type="textarea" placeholder="Please input" />
    </MyDialog>
  </div>
</template>

<style scoped lang="scss" src="./styles/asideFn.scss"></style>
