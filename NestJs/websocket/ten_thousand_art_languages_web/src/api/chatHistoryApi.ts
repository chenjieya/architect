import type { CHAT_HISTORY_TYPE_ENUM } from '@/enum/chat-history'
import http from '@/utils/request'

interface IChatHistory {
  id: number
  content: string
  type: CHAT_HISTORY_TYPE_ENUM
  chatroomId: number
  senderId: number
  sendTime: string
  updateTime: string
  sender: ISenderUser
}

interface ISenderUser {
  id: number
  username: string
  nickName: string | null
  email: string
  headPic: string | null
  createTime: string
  updateTime: string
}

export async function getHistoryList(params: { chatroomId: number }) {
  return await http.get<IChatHistory[]>('/api/chat-history/list', params)
}
