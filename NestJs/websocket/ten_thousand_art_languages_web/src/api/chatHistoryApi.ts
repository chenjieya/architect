import http from '@/utils/request'

interface IChatHistory {
  id: number
  content: string
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
