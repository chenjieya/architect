<script setup lang="ts" name="TestComp">
const testRef = ref<HTMLElement | null>(null)
</script>

<template>
  <div id="test-container">
    ceshi
    <div ref="testRef">casdasds</div>
  </div>
</template>

<style scoped lang="scss"></style>
