<script setup lang="ts">
import { ref } from "vue";
import { debounce } from "lodash-es";
import NotFound from "./views/NotFound.vue";
// 框架
// 组件
// 方法/类型
const count = ref(0);
const value = ref();

function handleCount() {
  count.value += 1;
}

function handleInput(e: InputEvent) {
  console.log((e.target as HTMLInputElement).value);
}

const inputFun = debounce(handleInput, 1000);
</script>

<template>
  <!-- <div class="app-container"> -->
  <!-- <h1>welcome!!!</h1>
    <input type="text" @input="inputFun" />
    <button @click="handleCount">{{ count }}</button> -->

  <NotFound />
  <!-- </div> -->
</template>

<style scoped lang="scss"></style>
