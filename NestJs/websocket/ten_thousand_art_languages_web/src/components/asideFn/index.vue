<script setup lang="ts" name="AsideFnComp">
import CheckoutRow from '@/components/checkoutRow/index.vue'
import MyDialog from '@/components/myDialog/index.vue'
import FriendRequest from '@/components/friendRequest/index.vue'

const myGroupDialogRef = ref<InstanceType<typeof MyDialog> | null>(null)
const checkoutRef = ref<InstanceType<typeof CheckoutRow> | null>(null)

/**打开创建群组弹框 */
const handleClick = () => myGroupDialogRef.value?.openMyDialog()

/**关闭弹框要做的事情-初始化 */
const handleCloseMyDialog = () => {
  const checkoutRowRefArr: any = checkoutRef.value
  for (let i = 0; i < checkoutRowRefArr?.length; i++) {
    checkoutRowRefArr[i].toggleSelection(false)
  }

  console.log('关闭弹框前的回调')
}

/**点击弹框内确定按钮要做的事情-提交表单 */
const handleSubmitMyDialog = () => {
  console.log('提交表单')
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
const myFriendDialogRef = ref<InstanceType<typeof MyDialog> | null>(null)
const handleFriendClick = () => myFriendDialogRef.value?.openMyDialog()
const handleCloseMyFriendDialog = () => {}
const handleSubmitMyFriendDialog = () => {}
</script>

<template>
  <div id="aside-fn-container">
    <div class="item-project" @click="handleClick">创建群聊</div>
    <div class="item-project badge" @click="handleFriendClick">新的朋友</div>
    <div class="item-project">个人信息</div>
    <div class="item-project" @click="handleBugClick">BUG反馈</div>
    <!-- 创建群聊 -->
    <MyDialog
      ref="myGroupDialogRef"
      title="创建群聊"
      @closeMyDialog="handleCloseMyDialog"
      @submitMyDialog="handleSubmitMyDialog"
    >
      <CheckoutRow v-for="item in 20" :key="item" ref="checkoutRef" />
    </MyDialog>
    <!-- 新的朋友 -->
    <MyDialog
      ref="myFriendDialogRef"
      title="新的朋友"
      @closeMyDialog="handleCloseMyFriendDialog"
      @submitMyDialog="handleSubmitMyFriendDialog"
    >
      <FriendRequest v-for="item in 20" :key="item" />
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
