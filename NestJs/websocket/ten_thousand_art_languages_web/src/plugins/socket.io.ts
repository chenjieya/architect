import { io } from 'socket.io-client'
import type { App } from 'vue'
import type { ManagerOptions, SocketOptions } from 'socket.io-client'
import type { Socket } from 'socket.io-client'

// socket 返回的实列对象
export const socketKey = Symbol() as InjectionKey<Socket>

export default {
  install: (
    app: App,
    {
      connection,
      options
    }: {
      connection: string
      options?: Partial<ManagerOptions & SocketOptions>
    }
  ) => {
    const socket = io(connection, options)
    app.config.globalProperties.$socket = socket
    app.provide(socketKey, socket)
  }
}
