import type { CHAT_HISTORY_TYPE_ENUM } from '@/enum/chat-history'
import http from '@/utils/request'

interface ICursorPaginationReposeon<T> {
  data: T
  hasMore: boolean
  nextCursor: number
}

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

export interface ICursorPagination {
  limit: number
  cursor?: number
}

export async function getHistoryList(params: { chatroomId: number }, data: ICursorPagination) {
  return await http.post<ICursorPaginationReposeon<IChatHistory[]>>(
    '/api/chat-history/list',
    data,
    {},
    params
  )
}
