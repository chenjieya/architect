<script setup lang="ts" name="CheckoutRowComp">
/**自定义组件 */
import type { IUserInfo } from '@/api/userApi'
import AvatarName from '@/components/avatarName/index.vue'

const props = defineProps<{ data: IUserInfo }>()

const isSelect = ref<boolean>(false)
const handleClick = () => {
  isSelect.value = !isSelect.value
}

const toggleRowSelection = (flag: boolean) => {
  isSelect.value = flag
}

defineExpose({
  toggleSelection: toggleRowSelection
})
</script>

<template>
  <div id="checkout-container" @click="handleClick">
    <el-checkbox v-model="isSelect" @click="handleClick" style="margin-right: 5px" />
    <AvatarName :avatar-url="data.headPic" :nickname="data.nickName || data.username" />
  </div>
</template>

<style scoped lang="scss">
#checkout-container {
  width: 100%;
  height: 35px;
  padding: 0 10px;
  @include flex;
  cursor: pointer;
  &:hover {
    background-color: var(--chat-main-background-color);
  }
  #avatar-name-container {
    &:hover {
      background-color: transparent !important;
    }
  }
}
</style>
