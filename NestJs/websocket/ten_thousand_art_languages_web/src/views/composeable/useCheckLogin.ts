import { ref, computed, onUnmounted } from 'vue'
import type { Ref } from 'vue'
import { check } from '@/api/userApi'
import { QRCODE_STATUS } from '@/enum/qrcode'
import { useUserStore } from '@/stores/user'
import { ElMessage } from 'element-plus'

export function useCheckLogin(qrcodeId: Ref<string>) {
  const { setToken, getUserInfo } = useUserStore()
  const status = ref<QRCODE_STATUS | null>(null)
  const loading = ref(false)
  const timer = ref<number | null>(null)

  /** 是否显示遮罩 */
  const showMask = computed(() => {
    return (
      status.value === QRCODE_STATUS.SCANNED ||
      status.value === QRCODE_STATUS.CONFIRMED ||
      status.value === QRCODE_STATUS.CANCELLED ||
      status.value === QRCODE_STATUS.EXPIRED
    )
  })

  /** 遮罩文案 */
  const maskText = computed(() => {
    switch (status.value) {
      case QRCODE_STATUS.SCANNED:
        return '已扫码'
      case QRCODE_STATUS.CONFIRMED:
        return '已确认，正在登录...'
      case QRCODE_STATUS.CANCELLED:
        return '已取消'
      case QRCODE_STATUS.EXPIRED:
        return '已过期'
      default:
        return ''
    }
  })

  /** 是否允许点击刷新 */
  const canRefresh = computed(() => {
    return (
      status.value === QRCODE_STATUS.SCANNED ||
      status.value === QRCODE_STATUS.CANCELLED ||
      status.value === QRCODE_STATUS.EXPIRED
    )
  })

  /** 查询一次状态 */
  const queryOnce = async (): Promise<boolean> => {
    loading.value = true
    const res = await check({ id: qrcodeId.value })
    loading.value = false

    // ✅ 登录成功（最终态）
    if (res.access_token) {
      localStorage.setItem('token', res.access_token)
      setToken(res.access_token)
      await getUserInfo()
      ElMessage.success('登录成功🏅')
      stopPolling()
      return true
    }

    status.value = res.status
    return false
  }

  /** 开始轮询 */
  const startPolling = (interval = 1000, onSuccess?: () => void) => {
    stopPolling()

    timer.value = window.setInterval(async () => {
      const success = await queryOnce()
      if (success) {
        onSuccess?.()
      }
    }, interval)
  }

  /** 停止轮询 */
  const stopPolling = () => {
    if (timer.value) {
      clearInterval(timer.value)
      timer.value = null
    }
  }

  onUnmounted(stopPolling)

  return {
    status,
    showMask,
    maskText,
    canRefresh,
    startPolling,
    stopPolling
  }
}
