<script setup lang="ts" name="Welcome">
const testRef = ref<HTMLElement | null>(null)
</script>

<template>
  <div id="test-container">
    welcome
    <div ref="testRef">welcome</div>
  </div>
</template>

<style scoped lang="scss"></style>
