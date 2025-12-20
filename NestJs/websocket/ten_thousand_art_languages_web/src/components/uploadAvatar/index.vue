<script lang="ts" setup>
import type { UploadProps, UploadRequestOptions } from 'element-plus'
import { tempSecretMinio, uploadFileMinio } from '@/api/minioApi'

const imageUrl = defineModel({ default: '' })

const dialogImageUrl = ref('')
const dialogVisible = ref(false)

// 上传图片之前的校验
const beforeAvatarUpload: UploadProps['beforeUpload'] = (rawFile) => {
  if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('照片大小不能超过10MB!')
    return false
  }
  return true
}

async function fileUpload(options: UploadRequestOptions) {
  const { file } = options

  try {
    // 1️⃣ 调用你自己的上传接口
    // 获取临时凭证
    const tempSecretUrl = await tempSecretMinio({ filename: file.name })
    // 调用上传接口
    await uploadFileMinio(tempSecretUrl, file)
    // 2️⃣ 上传成功后，回填图片地址
    imageUrl.value = `${import.meta.env.VITE_API_MINIO}/${file.name}`
  } catch (err) {
    ElMessage.error('头像上传失败')
  }
}
</script>

<template>
  <el-upload
    class="avatar-uploader"
    accept="image/*"
    :limit="1"
    list-type="picture-card"
    :show-file-list="false"
    :before-upload="beforeAvatarUpload"
    :http-request="fileUpload"
  >
    <img v-if="imageUrl" :src="imageUrl" class="avatar" />
    <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
  </el-upload>
  <el-dialog v-model="dialogVisible">
    <img w-full :src="dialogImageUrl" alt="预览图片" />
  </el-dialog>
</template>

<style scoped>
.avatar-uploader .avatar {
  width: 100px;
  height: 100px;
  display: block;
}
</style>

<style lang="scss" src="./styles/uploadAvatar.scss"></style>
