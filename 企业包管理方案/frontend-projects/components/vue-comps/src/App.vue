<template>
  <h1>公司内部组件</h1>
  <!-- 按钮组件测试 -->
  <div class="row">
    <app-button>按钮</app-button>
    <app-button type="primary">primary按钮</app-button>
    <app-button type="success">success按钮</app-button>
    <app-button type="info">info按钮</app-button>
    <app-button type="danger">danger按钮</app-button>
    <app-button type="warning">warning按钮</app-button>
  </div>
  <div class="row">
    <app-button plain>按钮</app-button>
    <app-button plain type="primary">primary按钮</app-button>
    <app-button plain type="success">success按钮</app-button>
    <app-button plain type="info">info按钮</app-button>
    <app-button plain type="danger">danger按钮</app-button>
    <app-button plain type="warning">warning按钮</app-button>
  </div>
  <div class="row">
    <app-button plain round>按钮</app-button>
    <app-button plain round type="primary">primary按钮</app-button>
    <app-button plain round type="success">success按钮</app-button>
    <app-button plain round type="info">info按钮</app-button>
    <app-button plain round type="danger">danger按钮</app-button>
    <app-button plain round type="warning">warning按钮</app-button>
  </div>
  <div class="row">
    <app-button plain round circle>好</app-button>
    <app-button plain round circle type="primary">好</app-button>
    <app-button plain round circle type="success">学</app-button>
    <app-button plain round circle type="info">习</app-button>
    <app-button plain round circle type="danger">前</app-button>
    <app-button plain round circle type="warning">端</app-button>
  </div>
  <div class="row">
    <app-button disabled>按钮</app-button>
    <app-button disabled type="primary">primary按钮</app-button>
    <app-button disabled type="success">success按钮</app-button>
    <app-button disabled type="info">info按钮</app-button>
    <app-button disabled type="danger">danger按钮</app-button>
    <app-button disabled type="warning">warning按钮</app-button>
  </div>
  <div class="row">
    <app-button icon="milk-tea"></app-button>
    <app-button type="primary" icon="camera">照相机</app-button>
    <app-button type="success" icon="coffee"></app-button>
    <app-button type="info" icon="orange"></app-button>
    <app-button type="danger" icon="goblet"></app-button>
    <app-button type="warning" icon="cloudy"></app-button>
  </div>
  <div class="row">
    <app-button type="primary" @click="clickHandle">点击</app-button>
  </div>

  <!-- 卡片测试1 -->
  <app-card imgSrc="/images/web.png" summary="前端主流布局系统进阶与实战，轻松解决页面布局难题" />
  <br />
  <!-- 卡片测试2 -->
  <app-card imgSrc="/images/go.png" summary="Google资深工程师深度讲解Go语言 由浅入深掌握Go语言">
    <template v-slot:footer>
      <div class="footer">
        <div class="level">中级 · 5225人报名</div>
        <div class="price">￥399.00</div>
      </div>
    </template>
  </app-card>
  <br />
  <!-- 卡片测试3 -->
  <app-card imgSrc="/images/java.png" :width="370" :imgHeight="90">
    路线吃透面试学问，伴随身为Java工程师的你一路成长，高效充分准备面试拿offer。
    <template v-slot:footer>
      <div class="footer-java">
        <div class="level">3步骤 · 3门课</div>
        <div class="level">10982收藏</div>
      </div>
    </template>
  </app-card>

  <!-- 弹出框组件测试 -->
  <app-dialog title="温馨提示" width="30vw" v-model:visible="visible" @close="closeDialog">
    这是一个 Dialog 弹出框
    <template v-slot:footer>
      <app-button @click="closeDialog">取消</app-button>
      <app-button type="primary" @click="closeDialog">确定</app-button>
    </template>
  </app-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue'
const visible = ref(false)
function closeDialog() {
  visible.value = false
}

function clickHandle() {
  // alert('点击了按钮')
  visible.value = true
}
</script>

<style scoped>
.row {
  margin-bottom: 20px;
  width: 800px;
  display: flex;
  justify-content: space-evenly;
}

.footer {
  padding: 0 8px;
  font-size: 12px;
  text-align: left;
}

.level {
  color: #9199a1;
  margin-bottom: 8px;
}

.price {
  color: #f01414;
}

.footer-java {
  display: flex;
  justify-content: space-between;
  font-size: 12px;
  padding: 0 8px;
}
</style>
