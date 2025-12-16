<script setup lang="ts" name="UserContextMenuComp">
import { ContextMenu, ContextMenuItem, type MenuOptions } from '@imengyu/vue3-context-menu'
interface contextItemOptionsInter {
  label: string
  handler: () => void
}

const props = defineProps<{
  menuOptions?: MenuOptions
  contextItemOptions: contextItemOptionsInter[]
}>()
</script>

<template>
  <context-menu
    :options="{
      x: 0,
      y: 0,
      ...props.menuOptions
    }"
  >
    <context-menu-item
      v-for="item in props.contextItemOptions"
      :key="item.label"
      :label="item.label"
      @click="item.handler"
    />
  </context-menu>
</template>

<style lang="scss" src="./styles/userContextMenu.scss"></style>
