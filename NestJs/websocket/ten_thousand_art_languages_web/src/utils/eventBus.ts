import mitt from 'mitt'
import type { Emitter } from 'mitt'
import type { DataType } from '@/components/asideGroup/types/asideGroup'
import type { sendMsgType } from '@/components/sendMsg/types/sendMsg'

type Events = {
  clickSession: DataType
  clickSendMsg: sendMsgType
  handleFriendRequest: boolean
}

const emitter: Emitter<Events> = mitt<Events>()
export default emitter
