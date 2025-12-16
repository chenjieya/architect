/// <reference types="vite/client" />

/**
 * 定义env环境类型
 */
interface ImportMetaEnv {
  /** API 前缀 */
  readonly VITE_API_PREFIX: string
  /** WS 地址 */
  readonly VITE_WS_URL: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
