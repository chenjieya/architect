<script setup lang="ts" name="AsideCardComp">
import AvatarName from '@/components/avatarName/index.vue'
import UserContextMenu from '@/components/userContextMenu/index.vue'
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

const count = ref(20)
const loading = ref(false)
const noMore = computed(() => count.value >= 40)
const disabled = computed(() => loading.value || noMore.value)

const load = () => {
  loading.value = true
  setTimeout(() => {
    count.value += 2
    loading.value = false
  }, 2000)
}

const userContextMenuVisable = ref(false)
// 弹出定位
const menuOptions = ref({ x: 0, y: 0 })
const handleRightClick = (event: PointerEvent) => {
  event.preventDefault()
  const { x, y } = event
  menuOptions.value.x = x
  menuOptions.value.y = y
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
        <div v-infinite-scroll="load" :infinite-scroll-disabled="disabled">
          <AvatarName
            v-for="i in count"
            :key="i"
            :class="i !== 1 ? 'outline-item' : ''"
            @contextmenu.prevent.stop="handleRightClick($event)"
          />
        </div>
        <p v-if="loading" class="loading">Loading...</p>
        <p v-if="noMore" class="loading">暂无更多</p>
      </el-scrollbar>

      <UserContextMenu
        v-model:show="userContextMenuVisable"
        :menuOptions="menuOptions"
        :context-item-options="$attrs['context-item-options'] as contextItemOptionsInter[]"
      />
    </div>
  </div>
</template>

<style scoped lang="scss" src="./style/index.scss"></style>
