<script setup lang="ts" name="FriendRequestComp">
import { rejectFriendRequest, resolveFriendRequest, type IFriendRequest } from '@/api/friendApi'
import AvatatName from '@/components/avatarName/index.vue'
import eventBus from '@/utils/eventBus'
import { ElMessage } from 'element-plus'
const props = defineProps<{ data: IFriendRequest }>()

async function resolveAddFriend() {
  const res = await resolveFriendRequest(props.data.id)
  if (res.success) {
    // 添加好友成功
    ElMessage.success('添加好友成功')
    // 刷新 好友请求列表， 刷新好友列表
    eventBus.emit('handleFriendRequest', true)
  } else {
    ElMessage.error('添加好友失败')
  }
}
async function rejectAddFriend() {
  const res = await rejectFriendRequest(props.data.id)
  if (res.success) {
    // 添加好友成功
    ElMessage.success('拒绝添加好友成功')
    // 刷新 好友请求列表
    eventBus.emit('handleFriendRequest', false)
  } else {
    ElMessage.error('拒绝添加好友失败')
  }
}

onBeforeUnmount(() => {
  // eventBus.off('handleFriendRequest')
})
</script>

<template>
  <div id="friend-request-container">
    <AvatatName
      :avatar-url="data.fromUser.headPic"
      :nickname="data.fromUser.nickName || data.fromUser.username"
    />
    <div>
      <el-button type="primary" link @click="resolveAddFriend">同意</el-button>
      <el-button type="danger" link @click="rejectAddFriend">拒绝</el-button>
    </div>
  </div>
</template>

<style scoped lang="scss">
#friend-request-container {
  width: 100%;
  height: 35px;
  @include flex(space-between, center);
  &:hover {
    background-color: var(--chat-main-background-color);
  }

  #avatar-name-container {
    margin-bottom: 0 !important;
    &:hover {
      background-color: transparent !important;
    }
  }
}
</style>
