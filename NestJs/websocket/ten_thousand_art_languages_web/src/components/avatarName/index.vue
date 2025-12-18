<script setup lang="ts" name="AvatarNameComp">
const props = withDefaults(
  defineProps<{
    avatarUrl?: string | null
    nickname: string
  }>(),
  {
    avatarUrl:
      'https://thirdwx.qlogo.cn/mmopen/vi_32/L227JibHBiaAxYxiapWjiapRWW8DrAkPW5RnWkyshxwia7ibljiaZDEiaz1dib7kF8L1HBuhDJoT3vDNZl6SlMiaeM2N0V8ibz0Mm1PhibKzWGAYsR3iakXw/132'
  }
)
</script>

<template>
  <div id="avatar-name-container" class="online-item">
    <img
      class="avatar"
      :src="
        avatarUrl ??
        'https://thirdwx.qlogo.cn/mmopen/vi_32/L227JibHBiaAxYxiapWjiapRWW8DrAkPW5RnWkyshxwia7ibljiaZDEiaz1dib7kF8L1HBuhDJoT3vDNZl6SlMiaeM2N0V8ibz0Mm1PhibKzWGAYsR3iakXw/132'
      "
      alt="用户头像"
    />
    <i class="status online-status"></i>
    <span class="nickname">{{ nickname }}</span>
  </div>
</template>

<style scoped lang="scss" src="./styles/avatarName.scss"></style>
