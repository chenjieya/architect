import mitt from 'mitt'
import type { Emitter } from 'mitt'
import type { sendMsgType } from '@/components/sendMsg/types/sendMsg'
import type { IChatSession } from '@/components/asideGroup/index.vue'

type Events = {
  clickSession: IChatSession
  clickSendMsg: sendMsgType
  handleFriendRequest: boolean
  chatroomUserRequest: number
}

const emitter: Emitter<Events> = mitt<Events>()
export default emitter
