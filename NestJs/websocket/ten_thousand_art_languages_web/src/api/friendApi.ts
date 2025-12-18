import type { FRIEND_REQUEST_ENUM } from '@/enum/friend'
import http from '@/utils/request'
import type { IUserInfo } from './userApi'

export interface IFriendRequest {
  id: number
  fromUserId: number
  toUserId: number
  status: FRIEND_REQUEST_ENUM
  createTime: string
  updateTime: string
  fromUser: FromUser
}
interface FromUser {
  id: number
  username: string
  password: string
  nickName: string | null
  email: string
  headPic: string | null
  createTime: string
  updateTime: string
}

// 发送好友请求
export async function postFriendRequest(params: { friendId: number }) {
  return await http.post<IFriendRequest>('/api/friend-ship/add', params, { showError: true })
}

// 拒绝好友请求
export async function rejectFriendRequest(id: number) {
  return await http.get<{ success: boolean }>(
    `/api/friend-ship/reject/${id}`,
    {},
    { showError: true }
  )
}

// 同意好友请求
export async function resolveFriendRequest(id: number) {
  return await http.get<{ success: boolean }>(
    `/api/friend-ship/resolve/${id}`,
    {},
    { showError: true }
  )
}

// 好友请求列表
export async function friendRequestList() {
  return await http.get<IFriendRequest[]>(`/api/friend-ship/request-list`, {}, { showError: true })
}

// 好友列表
export async function friendList() {
  return await http.get<IUserInfo[]>(`/api/friend-ship/list`, {}, { showError: true })
}

// 删除
export async function deleteFriend(id: number) {
  return await http.delete<{ success: boolean }>(
    `/api/friend-ship/delete/${id}`,
    {},
    { showError: true }
  )
}
