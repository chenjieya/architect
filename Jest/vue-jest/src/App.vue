<script setup lang="ts"></script>

<template>
  <div class="main-container">
    <h1>You did it!</h1>
    <div class="button-group">
      <router-link to="/">首页</router-link>
      <router-link to="/about">关于</router-link>
      <router-link to="/basic">Basic</router-link>
      <router-link to="/login">Login</router-link>
    </div>
    <router-view />
  </div>
</template>

<style scoped>
.main-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  height: 100vh;
  width: 100vw;
}

.button-group {
  display: flex;
  gap: 20px;
  margin-bottom: 20px;
}
</style>
