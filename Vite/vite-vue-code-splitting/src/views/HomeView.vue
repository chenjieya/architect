<script setup>
import { defineAsyncComponent, ref, onMounted } from "vue";

const test = defineAsyncComponent(() => import("./UserView.vue"));

const isVisible = ref(false);
const trigger = ref(null);

onMounted(() => {
  const observer = new IntersectionObserver(([entry]) => {
    if (entry.isIntersecting) {
      isVisible.value = true; // ✅ 这时 <Test /> 才出现在模板中
      observer.disconnect(); // 触发下载并渲染
    }
  });
  observer.observe(trigger.value);
});
</script>
<template>
  <div>
    <h2 style="height: calc(100vh - 50px); border: 1px solid">首页</h2>
  </div>
  <div ref="trigger"></div>
  <test v-if="isVisible" />
</template>
