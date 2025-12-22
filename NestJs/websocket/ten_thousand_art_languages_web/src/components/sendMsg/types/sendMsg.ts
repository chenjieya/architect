export type sendMsgType = {
  from: number
  to: string | null
  content: string
  sender: {
    id: number
    username: string
    nickName: string | null
    headPic: string | null
  }
}
