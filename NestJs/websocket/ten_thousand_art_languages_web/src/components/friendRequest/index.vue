<script setup lang="ts" name="FriendRequestComp">
import AvatatName from '@/components/avatarName/index.vue'
</script>

<template>
  <div id="friend-request-container">
    <AvatatName />
    <div>
      <el-button type="primary" link>同意</el-button>
      <el-button type="danger" link>拒绝</el-button>
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
