// src/utils/http/index.ts
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig
} from 'axios'
import { ElMessage, ElMessageBox, ElLoading } from 'element-plus'

// 基础响应类型
export type BaseResponse<T = any> = T
// {
//   // code: number
//   data: T
//   // message: string
//   // success: boolean
// }

// 扩展配置
export interface RequestConfig extends AxiosRequestConfig {
  // 是否显示 loading
  showLoading?: boolean
  // 是否显示错误消息
  showError?: boolean
  // 自定义错误处理
  customErrorHandler?: (error: any) => void
  // 请求重试次数
  retry?: number
  // 请求重试延迟（毫秒）
  retryDelay?: number
}

class HttpClient {
  private instance: AxiosInstance
  private loadingCount = 0
  private loadingInstance: any = null

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(config)
    this.setupInterceptors()
  }

  // 设置拦截器
  private setupInterceptors() {
    // 请求拦截器
    this.instance.interceptors.request.use(
      (config: InternalAxiosRequestConfig) => {
        // 添加 token
        const token = localStorage.getItem('token')
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }

        // 处理 loading
        if ((config as RequestConfig).showLoading) {
          this.showLoading()
        }

        return config
      },
      (error) => {
        // 请求错误处理
        if ((error.config as RequestConfig)?.showLoading) {
          this.hideLoading()
        }
        return Promise.reject(error)
      }
    )

    // 响应拦截器
    this.instance.interceptors.response.use(
      (response: AxiosResponse<BaseResponse>) => {
        // 隐藏 loading
        if ((response.config as RequestConfig)?.showLoading) {
          this.hideLoading()
        }

        const { data, status } = response

        // 根据业务逻辑处理
        if (status === 401) {
          // Token 过期
          this.handleTokenExpired()
          return Promise.reject(new Error('登录已过期，请重新登录'))
        }

        if (status !== 200 && status !== 201 && status !== 304) {
          // 业务错误
          if ((response.config as RequestConfig)?.showError !== false) {
            ElMessage.error(data.message || '请求失败')
          }
          return Promise.reject(data)
        }

        return data
      },
      (error) => {
        // 隐藏 loading
        if ((error.config as RequestConfig)?.showLoading) {
          this.hideLoading()
        }

        // 自定义错误处理
        const customHandler = (error.config as RequestConfig)?.customErrorHandler
        if (customHandler) {
          customHandler(error)
          return Promise.reject(error)
        }

        // 默认错误处理
        this.handleError(error)
        return Promise.reject(error)
      }
    )
  }

  // 显示 loading
  private showLoading() {
    if (this.loadingCount === 0) {
      this.loadingInstance = ElLoading.service({
        lock: true,
        text: '加载中...',
        background: 'rgba(0, 0, 0, 0.7)'
      })
    }
    this.loadingCount++
  }

  // 隐藏 loading
  private hideLoading() {
    this.loadingCount--
    if (this.loadingCount <= 0 && this.loadingInstance) {
      this.loadingInstance.close()
      this.loadingInstance = null
      this.loadingCount = 0
    }
  }

  // 处理 token 过期
  private handleTokenExpired() {
    localStorage.removeItem('token')
    localStorage.removeItem('userInfo')

    // ElMessageBox.confirm('登录已过期，请重新登录', '提示', {
    //   confirmButtonText: '重新登录',
    //   cancelButtonText: '取消',
    //   type: 'warning'
    // }).then(() => {
    // window.location.href = '/login'
    // })
  }

  // 处理错误
  private handleError(error: any) {
    if (error.response) {
      // 服务器响应错误
      switch (error.response.status) {
        case 400:
          ElMessage.error(error.response.data?.message || '程序异常，请联系管理员')
          break
        case 401:
          ElMessage.error('未授权，请先登录')
          this.handleTokenExpired()
          break
        case 403:
          ElMessage.error('拒绝访问')
          break
        case 404:
          ElMessage.error('请求的资源不存在')
          break
        case 500:
          ElMessage.error('服务器内部错误')
          break
        case 502:
          ElMessage.error('网关错误')
          break
        case 503:
          ElMessage.error('服务不可用')
          break
        case 504:
          ElMessage.error('网关超时')
          break
        default:
          ElMessage.error(`请求错误: ${error.response.status}`)
      }
    } else if (error.request) {
      // 请求未收到响应
      ElMessage.error('网络错误，请检查网络连接')
    } else {
      // 其他错误
      ElMessage.error(error.message || '请求失败')
    }
  }

  // 通用请求方法
  public request<T = any>(config: RequestConfig): Promise<BaseResponse<T>> {
    return this.instance.request(config)
  }

  // GET 请求
  public get<T = any>(url: string, params?: any, config?: RequestConfig): Promise<BaseResponse<T>> {
    return this.instance.get(url, { params, ...config })
  }

  // POST 请求
  public post<T = any>(
    url: string,
    data?: any,
    config?: RequestConfig,
    params?: any
  ): Promise<BaseResponse<T>> {
    return this.instance.post(url, data, { params, ...config })
  }

  // PUT 请求
  public put<T = any>(url: string, data?: any, config?: RequestConfig): Promise<BaseResponse<T>> {
    return this.instance.put(url, data, config)
  }

  // DELETE 请求
  public delete<T = any>(
    url: string,
    params?: any,
    config?: RequestConfig
  ): Promise<BaseResponse<T>> {
    return this.instance.delete(url, { params, ...config })
  }

  // PATCH 请求
  public patch<T = any>(url: string, data?: any, config?: RequestConfig): Promise<BaseResponse<T>> {
    return this.instance.patch(url, data, config)
  }

  // 上传文件
  public upload<T = any>(
    url: string,
    formData: FormData,
    config?: RequestConfig
  ): Promise<BaseResponse<T>> {
    return this.instance.post(url, formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      ...config
    })
  }

  // 下载文件
  public download(url: string, params?: any, config?: RequestConfig): Promise<Blob> {
    return this.instance
      .get(url, {
        responseType: 'blob',
        params,
        ...config
      })
      .then((response) => response.data)
  }
}

// 创建实例
const http = new HttpClient({
  timeout: 60000,
  headers: {
    'Content-Type': 'application/json;charset=UTF-8'
  }
})

export const minioAxios = axios.create({
  timeout: 60000
})

export default http
