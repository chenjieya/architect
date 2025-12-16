<script setup lang="ts" name="MyDialogComp">
const emit = defineEmits(['closeMyDialog', 'submitMyDialog'])

const dialogVisible = ref(false)

/**打开弹框-暴露给父组件的方法 */
const openDialog = () => {
  dialogVisible.value = true
}

/**确定按钮 */
const confirmBtn = () => {
  emit('submitMyDialog')
  dialogVisible.value = false
}

/**取消按钮 */
const cancelBtn = () => {
  dialogVisible.value = false
}

/**关闭弹框前的回调 */
const closeDialogBefore = () => {
  emit('closeMyDialog')
}

defineExpose({
  openMyDialog: openDialog
})
</script>

<template>
  <!-- 测试弹出框 -->
  <el-dialog
    v-model="dialogVisible"
    title="Tips"
    append-to-body
    :modal="true"
    :close-on-click-modal="false"
    width="30%"
    v-bind="$attrs"
    @close="closeDialogBefore"
  >
    <slot></slot>
    <template #footer>
      <span class="dialog-footer">
        <div class="item-project" @click="confirmBtn">确定</div>
        <div class="item-project" @click="cancelBtn">取消</div>
      </span>
    </template>
  </el-dialog>
</template>

<style scoped lang="scss" src="./styles/myDialog.scss"></style>
