<script setup lang="ts" name="personInfo">
import type { FormInstance, FormRules } from 'element-plus'
// 框架
// 组件
import UploadAvatar from '@/components/uploadAvatar/index.vue'
// 方法/类型
import { getUserInfo, updateUserInfo, type IUserInfo } from '@/api/userApi'
import { useUserStore } from '@/stores/user'

const store = useUserStore()

const props = defineProps<{
  personInfoVisible: boolean
  personSubmit: boolean
}>()

const formRef = ref<FormInstance>()

const form = reactive({
  nickName: '',
  email: '',
  headPic: ''
})

const userInfo = ref<IUserInfo>()

const rules = reactive<FormRules<typeof form>>({
  headPic: [{ required: true, message: '请上传头像', trigger: 'change' }],
  nickName: [
    { required: true, message: '请输入昵称', trigger: 'blur' },
    { min: 3, message: '昵称长度不得低于3位', trigger: 'blur' }
  ],
  email: [
    {
      required: true,
      message: '请输入邮箱',
      trigger: 'blur'
    },
    {
      type: 'email',
      message: '请输入正确的邮箱地址',
      trigger: ['blur', 'change']
    }
  ]
})

// 提交用户信息
async function submitUpdatePersonInfo() {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    // 提交用户信息
    if (!userInfo.value?.id) {
      ElMessage.error('用户ID不存在')
      return
    }
    const res = await updateUserInfo({
      id: userInfo.value.id,
      ...form
    })
    store.setUserInfo(res)
    ElMessage.success('修改个人信息成功')
  } catch (err) {
    console.log(err)
    ElMessage.error('表单检验失败，请重新填写')
  }
}

watch(
  () => props.personSubmit,
  (newVal) => {
    if (newVal) {
      // 执行提交函数
      submitUpdatePersonInfo()
    }
  }
)

watch(
  () => props.personInfoVisible,
  async (newVal) => {
    // 打开弹框
    // formRef.value?.resetFields()
    if (newVal) {
      console.log('打开弹框了')
      // 获取用户信息
      userInfo.value = await getUserInfo()
      const temp = userInfo.value || { nickName: '' }
      if (!userInfo.value?.nickName) {
        temp.nickName = userInfo.value?.username || ''
      }
      Object.assign(form, temp)
    } else {
      console.log('关闭弹框')
      // formRef.value?.resetFields()
    }
  },
  {
    immediate: true
  }
)
</script>

<template>
  <div id="person-info">
    <el-form ref="formRef" :model="form" label-width="auto" :rules="rules" status-icon>
      <el-form-item prop="headPic">
        <!-- <el-input v-model="form.headPic" /> -->
        <UploadAvatar v-model="form.headPic" />
      </el-form-item>
      <el-form-item label="昵称：" prop="nickName">
        <el-input v-model="form.nickName" />
      </el-form-item>
      <el-form-item label="邮箱：" prop="email">
        <el-input v-model="form.email" />
      </el-form-item>
    </el-form>
  </div>
</template>

<style scoped lang="scss" src="./styles/personInfo.scss"></style>
