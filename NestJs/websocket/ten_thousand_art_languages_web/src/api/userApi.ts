import type { QRCODE_STATUS } from '@/enum/qrcode'
import http from '@/utils/request'

export async function check(params: { id: string }) {
  return await http.get<{
    id?: string
    status: QRCODE_STATUS
    access_token?: string
  }>('/api/qrcode/check', params)
}

export async function generateCode() {
  return await http.get<{
    qrcode_id: string
    img: string
    content: string
  }>('/api/qrcode/generate')
}
