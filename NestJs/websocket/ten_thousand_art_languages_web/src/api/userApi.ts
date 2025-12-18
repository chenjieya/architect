import type { QRCODE_STATUS } from '@/enum/qrcode'
import http from '@/utils/request'

export interface IUserInfo {
  id: number
  username: string
  nickName: string | null
  email: string
  headPic: string | null
  createTime: string
  updateTime: string
}

export async function check(params: { id: string }) {
  return await http.get<{
    id?: string
    status: QRCODE_STATUS
    access_token?: string
  }>('/api/qrcode/check', params, { showError: true })
}

export async function generateCode() {
  return await http.get<{
    qrcode_id: string
    img: string
    content: string
  }>('/api/qrcode/generate', {}, { showError: true })
}

export async function getUserInfo() {
  return await http.get<IUserInfo>('/api/user/info', {}, { showError: true })
}
