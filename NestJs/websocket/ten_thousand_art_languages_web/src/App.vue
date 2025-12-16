<script setup lang="ts"></script>

<template>
  <div id="app-wrapper">
    <RouterView />
  </div>
</template>

<style scoped lang="scss">
#app-wrapper {
  width: 100vw;
  height: 100vh;
  overflow-y: auto;

  background-image: url('@/assets/img/bg.webp');
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
}
</style>
