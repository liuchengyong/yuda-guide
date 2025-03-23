import { ApiCode, ApiResponse } from '@/types/api'

/**
 * 请求配置接口
 */
export interface RequestConfig extends RequestInit {
  params?: Record<string, any> // URL参数
  data?: any // 请求体数据
  timeout?: number // 超时时间（毫秒）
}

/**
 * 请求错误类
 */
export class RequestError extends Error {
  code: number
  status?: number

  constructor(message: string, code: number, status?: number) {
    super(message)
    this.name = 'RequestError'
    this.code = code
    this.status = status
  }
}

/**
 * 请求工具类
 */
export class Request {
  private baseUrl: string
  private defaultConfig: RequestConfig
  private commonParams: Record<string, any> = {}

  /**
   * 构造函数
   * @param baseUrl 基础URL
   * @param defaultConfig 默认配置
   */
  constructor(baseUrl = '', defaultConfig: RequestConfig = {}) {
    this.baseUrl = baseUrl
    this.defaultConfig = {
      headers: {
        'Content-Type': 'application/json',
      },
      credentials: 'include', // 包含凭证（Cookie）
      timeout: 10000, // 默认10秒超时
      ...defaultConfig,
    }
  }

  /**
   * 设置通用请求头
   * @param headers 请求头对象
   */
  setHeaders(headers: Record<string, string>): void {
    this.defaultConfig.headers = {
      ...this.defaultConfig.headers,
      ...headers,
    }
  }

  /**
   * 设置公共参数
   * @param params 公共参数对象
   */
  setCommonParams(params: Record<string, any>): void {
    this.commonParams = {
      ...this.commonParams,
      ...params,
    }
  }

  /**
   * 获取当前公共参数
   * @returns 公共参数对象
   */
  getCommonParams(): Record<string, any> {
    return { ...this.commonParams }
  }

  /**
   * 构建完整URL（包含查询参数）
   * @param url 请求路径
   * @param params 查询参数
   * @returns 完整URL
   */
  private buildUrl(url: string, params?: Record<string, any>): string {
    // 构建完整URL
    const fullUrl = url.startsWith('http') ? url : `${this.baseUrl}${url}`

    // 如果没有查询参数，直接返回URL
    if (!params || Object.keys(params).length === 0) {
      return fullUrl
    }

    // 构建URL对象
    const urlObj = new URL(fullUrl)

    // 添加查询参数
    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        urlObj.searchParams.append(key, String(value))
      }
    })

    return urlObj.toString()
  }

  /**
   * 发送请求
   * @param url 请求路径
   * @param config 请求配置
   * @returns 响应数据
   */
  async request<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    // 合并配置
    const { params, data, timeout, ...fetchConfig } = {
      ...this.defaultConfig,
      ...config,
    }

    // 合并公共参数和请求参数
    const mergedParams = {
      ...this.commonParams,
      ...params,
    }

    // 构建完整URL
    const fullUrl = this.buildUrl(url, mergedParams)

    // 处理请求体
    if (
      !fetchConfig.body &&
      fetchConfig.method &&
      ['POST', 'PUT', 'PATCH'].includes(fetchConfig.method)
    ) {
      // 对于POST、PUT、PATCH请求，合并公共参数到请求体
      const mergedData = data ? { ...data } : {}

      // 只有当请求体是对象类型时才合并公共参数
      if (
        typeof mergedData === 'object' &&
        mergedData !== null &&
        !Array.isArray(mergedData)
      ) {
        fetchConfig.body = JSON.stringify(mergedData)
      } else {
        fetchConfig.body = JSON.stringify(data)
      }
    }

    try {
      // 创建AbortController用于超时控制
      const controller = new AbortController()
      fetchConfig.signal = controller.signal

      // 设置超时
      let timeoutId: NodeJS.Timeout | null = null
      if (timeout) {
        timeoutId = setTimeout(() => controller.abort(), timeout)
      }

      // 发送请求
      const response = await fetch(fullUrl, fetchConfig)

      // 清除超时定时器
      if (timeoutId) clearTimeout(timeoutId)

      // 解析响应JSON
      const responseData = (await response.json()) as ApiResponse<T>

      // 检查API响应状态
      if (responseData.code !== ApiCode.SUCCESS) {
        throw new RequestError(
          responseData.message || '请求失败',
          responseData.code,
          response.status,
        )
      }

      return responseData.data
    } catch (error) {
      // 处理请求错误
      if (error instanceof RequestError) {
        throw error
      } else if (error instanceof DOMException && error.name === 'AbortError') {
        throw new RequestError('请求超时', ApiCode.INTERNAL_ERROR)
      } else {
        throw new RequestError(
          error instanceof Error ? error.message : '网络请求失败',
          ApiCode.INTERNAL_ERROR,
        )
      }
    }
  }

  /**
   * GET请求
   * @param url 请求路径
   * @param config 请求配置
   * @returns 响应数据
   */
  get<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: 'GET' })
  }

  /**
   * POST请求
   * @param url 请求路径
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  post<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {},
  ): Promise<T> {
    return this.request<T>(url, { ...config, method: 'POST', data })
  }

  /**
   * PUT请求
   * @param url 请求路径
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  put<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {},
  ): Promise<T> {
    return this.request<T>(url, { ...config, method: 'PUT', data })
  }

  /**
   * DELETE请求
   * @param url 请求路径
   * @param config 请求配置
   * @returns 响应数据
   */
  delete<T = any>(url: string, config: RequestConfig = {}): Promise<T> {
    return this.request<T>(url, { ...config, method: 'DELETE' })
  }

  /**
   * PATCH请求
   * @param url 请求路径
   * @param data 请求数据
   * @param config 请求配置
   * @returns 响应数据
   */
  patch<T = any>(
    url: string,
    data?: any,
    config: RequestConfig = {},
  ): Promise<T> {
    return this.request<T>(url, { ...config, method: 'PATCH', data })
  }
}

// 创建默认请求实例
const request = new Request('/api')

export default request
