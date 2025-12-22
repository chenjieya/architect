import http from '@/utils/request'
import type { IUserInfo } from './userApi'

export interface IChatroom {
  id: number
  name: string
  showChatroomName: string
  type: boolean
  createTime: string
  updateTime: string
  userChatrooms: IUserChatroom[]
  userCount: number
}

export interface IUserChatroom {
  id: number
  userId: number
  chatroomId: number
  joinTime: string
}

export interface IChatroomUser extends Omit<IChatroom, 'userChatrooms'> {
  user: IUserInfo[]
}

// 创建私聊聊天室
export async function createPrivateChat(id: number) {
  return await http.get<Omit<IChatroom, 'userChatrooms' | 'userCount'>>(
    `/api/chatroom/create-private-chat/${id}`
  )
}

// 创建群聊聊天室
export async function createGroupChat(params: number[]) {
  return await http.post<Omit<IChatroom, 'userChatrooms' | 'userCount'>>(
    `/api/chatroom/create-group-chat`,
    params
  )
}

// 获取用户所有的聊天室
export async function getChatroomList() {
  return await http.get<IChatroom[]>(`/api/chatroom/list`)
}

// 获取聊天室内的成员
export async function getChatroomUser(params: { chatroomId: number }) {
  return await http.get<IUserInfo[]>(`/api/chatroom/members`, params)
}

// 获取单个聊天室所有信息（包含聊天室内的成员信息）
export async function getChatroomInfo(params: { chatroomId: number }) {
  return await http.get<IChatroomUser>(`/api/chatroom/info`, params)
}
