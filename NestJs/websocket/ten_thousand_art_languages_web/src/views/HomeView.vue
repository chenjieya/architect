<script setup lang="ts" name="HomeView">
import QrcodeVue from 'qrcode.vue'
/**自定义组件 */
import AsideCardComp from '@/components/asideCard/index.vue'
import AsideGroupComp from '@/components/asideGroup/index.vue'
import ChatRoom from '@/components/chatRoom/index.vue'
import AsideFn from '@/components/asideFn/index.vue'
import SendMsg from '@/components/sendMsg/index.vue'

/**自定义方法 */
import eventBus from '@/utils/eventBus'
import type { DataType } from '@/components/asideGroup/types/asideGroup'
import { useCheckLogin } from './composeable/useCheckLogin'
import { generateCode } from '@/api/userApi'
import { useUserStore } from '@/stores/user'

const qrCodeVisable = ref<boolean>(false)
const QrCode = ref<string>('')
const qrcodeId = ref<string>('')

const { isLogin } = useUserStore()

/**点击登录按钮 */
const handleLogin = async () => {
  qrCodeVisable.value = true
  await getCode()

  startPolling(1000, () => {
    qrCodeVisable.value = false
  })
}

/**右键菜单配置 */
const contextItemGroupOptions = reactive(
  /**菜单项 */
  [
    {
      label: '@艾特ta',
      handler: () => {
        console.log('@艾特ta')
      }
    },
    {
      label: '添加好友',
      handler: () => {
        console.log('添加好友')
      }
    },
    {
      label: '拉黑ta',
      handler: () => {
        console.log('拉黑ta')
      }
    }
  ]
)

const contextItemFriendOptions = reactive(
  /**菜单项 */
  [
    {
      label: '删除好友',
      handler: () => {
        console.log('删除好友')
      }
    },
    {
      label: '发消息',
      handler: () => {
        console.log('发消息')
      }
    }
  ]
)

/**监听会话窗口的点击事件 */
const sessionInfo = ref<DataType>()
eventBus.on('clickSession', (e) => {
  sessionInfo.value = e
})

async function getCode() {
  const res = await generateCode()
  QrCode.value = res.img
  qrcodeId.value = res.qrcode_id
}

const { showMask, maskText, canRefresh, startPolling, stopPolling } = useCheckLogin(qrcodeId)

const refreshQrCode = async () => {
  stopPolling()
  await getCode()
  startPolling(1000, () => {
    qrCodeVisable.value = false
  })
}
</script>

<template>
  <div id="home-container">
    <aside class="left drap-container" v-drag>
      <AsideCardComp
        draggable="true"
        title="在线人数:120000"
        :context-item-options="contextItemGroupOptions"
      />
      <AsideCardComp
        draggable="true"
        title="我的好友"
        :context-item-options="contextItemFriendOptions"
      />
    </aside>
    <main class="main">
      <div class="content">
        <aside class="session-aside">
          <el-scrollbar>
            <AsideGroupComp />
          </el-scrollbar>
        </aside>
        <main class="session-main">
          <header class="chat-content-header">
            <div class="name">{{ sessionInfo?.groupName }}</div>
            <div class="config">...</div>
          </header>
          <main class="chat-content-main">
            <ChatRoom />
          </main>
          <footer class="chat-content-footer">
            <div class="login-frame" v-if="!isLogin" @click="handleLogin">点击登录才能发送消息</div>
            <SendMsg v-else />
          </footer>
        </main>
      </div>
    </main>
    <aside class="right drap-container" v-drag>
      <AsideFn draggable="true" />
    </aside>

    <!-- 二维码弹出框 -->
    <el-dialog
      class="QrCode-dialog"
      v-model="qrCodeVisable"
      :before-close="
        (done) => {
          stopPolling()
          done()
        }
      "
      :show-close="false"
      width="376px"
    >
      <div
        class="qr-wrapper"
        style="width: 100%; display: flex; align-items: center; justify-content: center"
      >
        <img :src="QrCode" alt="" style="width: 330px" />
        <!-- <QrcodeVue :value="qrcodeValue" :margin="3" :size="330" /> -->
        <div
          v-if="showMask"
          class="qr-mask"
          :class="{ clickable: canRefresh }"
          @click="canRefresh && refreshQrCode()"
        >
          <span>{{ maskText }}</span>
          <span v-if="canRefresh" class="refresh-tip">点击刷新</span>
        </div>
      </div>
      <div class="QrCode-msg">
        <span>请使用「<strong class="login-desc-bold">微信</strong>」扫描二维码登录</span>
      </div>
    </el-dialog>
  </div>
</template>

<style scoped lang="scss">
#home-container {
  height: 100%;
  min-height: 400px;

  @include flex(space-between);
  padding: 0 5px;

  .main {
    flex: 1;
    margin: 0 50px;
    padding: 50px 0;
    .content {
      width: 100%;
      height: 100%;
      @include flex(flex-start);

      .session-aside {
        width: 300px;
        background-color: var(--chat-background-color);
        backdrop-filter: var(--chat-backdrop-filter);
        /** scss的嵌套属性写法 */
        border: {
          top-left-radius: 15px;
          bottom-left-radius: 15px;
        }
        overflow-y: auto;
        overflow-x: hidden;
      }

      .session-main {
        flex: 1;
        background-color: var(--chat-main-background-color);
        backdrop-filter: var(--chat-main-backdrop-filter);

        border: {
          top-right-radius: 15px;
          bottom-right-radius: 15px;
        }

        @include flex(null, null, column);

        .chat-content-header {
          height: 53px;
          padding: {
            left: 10px;
            right: 20px;
            top: 10px;
          }
          @include flex(space-between);
          color: white;

          .name {
            font: {
              size: 20px;
              weight: 700;
            }
            padding-top: 8px;
          }

          .config {
            font: {
              size: 20px;
              weight: 700;
            }
            cursor: pointer;
            user-select: none;
          }
        }

        .chat-content-main {
          flex: 1;
          overflow-y: auto;
          padding: 0 15px;
        }

        .chat-content-footer {
          height: 60px;
          @include flex(center, center);

          .login-frame {
            width: 600px;
            height: 40px;
            line-height: 40px;
            text-align: center;
            border: 2px solid rgba(255, 255, 255, 0.68);
            background-color: transparent;
            color: #ffffffa3;
            border-radius: 10px;
            font-size: 15px;
            font-weight: 700;
            letter-spacing: 5px;
            cursor: pointer;

            &:hover {
              color: aqua;
              border-color: aqua;
            }
          }
        }
      }
    }
  }

  .left,
  .right {
    @include flex(center, null, column);
  }

  :deep(.el-dialog .el-dialog__header) {
    height: 0 !important;
    padding: 0 !important;
  }

  :deep(.el-dialog__body) {
    max-height: 500px !important;
  }

  .QrCode-dialog {
    .qr-wrapper {
      position: relative;
      width: 330px;
      height: 330px;

      .qr-img {
        width: 100%;
        height: 100%;
      }

      .qr-mask {
        position: absolute;
        width: 344px;
        height: 330px;
        inset: 0;
        background: rgba(0, 0, 0, 0.55);
        color: #fff;
        @include flex(center, center, column);
        font-size: 18px;
        cursor: default;

        &.clickable {
          cursor: pointer;

          &:hover {
            background: rgba(0, 0, 0, 0.65);
          }
        }

        .refresh-tip {
          font-size: 14px;
          margin-top: 8px;
          color: #67c23a;
        }
      }
    }

    .QrCode-msg {
      width: 100%;
      @include flex(center, center);
      font-size: 16px;
      margin-top: 10px;
      .login-desc-bold {
        font-weight: 700;
        color: #67c23a;
      }
    }
  }
}
</style>
