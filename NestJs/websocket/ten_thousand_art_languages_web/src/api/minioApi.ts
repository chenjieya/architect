import http, { minioAxios } from '@/utils/request'

// 获取上传文件的临时密钥地址
export async function tempSecretMinio(params: { filename: string }) {
  return await http.get<string>('/api/minio/presignedUrl', params)
}

// 直接上传文件到minio服务
export async function uploadFileMinio(url: string, file: File) {
  return await minioAxios.put(url, file)
}
