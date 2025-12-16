<script setup lang="ts" name="MyIconComp">
import type { CSSProperties } from 'vue'
interface Props {
  size?: number | string
  color?: string
  name: string
}

const props = withDefaults(defineProps<Props>(), {
  size: 16,
  color: 'white'
})

const iconStyle = computed(() => {
  const styles: CSSProperties = {}

  styles.color = props.color
  styles.fontSize = typeof props.size === 'number' ? `${props.size}px` : props.size

  return styles
})
</script>

<template>
  <i class="iconfont" :class="`icon-${props.name}`" :style="iconStyle"></i>
</template>

<style scoped lang="scss"></style>
