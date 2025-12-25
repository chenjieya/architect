import type { CHAT_HISTORY_TYPE_ENUM } from '@/enum/chat-history'

export type sendMsgType = {
  id: number
  from: number
  to: string | null
  message: {
    type: CHAT_HISTORY_TYPE_ENUM
    content: string
  }
  sender: {
    id: number
    username: string
    nickName: string | null
    headPic: string | null
  }
}
