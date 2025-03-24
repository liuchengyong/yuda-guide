import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios'
import { ResponseData, ResponseStatus } from './http.model'
import { merge } from 'lodash'

class Request {
  instance: AxiosInstance

  constructor(config: AxiosRequestConfig) {
    this.instance = axios.create(merge({}, config))
  }

  async request<R, T>(config: AxiosRequestConfig<R>): Promise<ResponseData<T>> {
    let response = await this.instance.request<
      ResponseData<T>,
      AxiosResponse<ResponseData<T>>,
      R
    >(config)
    if (response.status === ResponseStatus.SUCCESS) {
      return response.data
    } else {
      return Promise.reject()
    }
  }

  /** GET 请求 */
  get<R, T>(
    url: string,
    params?: R,
    config?: AxiosRequestConfig<R>,
  ): Promise<ResponseData<T>> {
    return this.request<R, T>({ url, method: 'GET', params, ...config })
  }

  /** POST 请求 */
  post<R, T>(
    url: string,
    data?: R,
    config?: AxiosRequestConfig<R>,
  ): Promise<ResponseData<T>> {
    return this.request<R, T>({ url, method: 'POST', data, ...config })
  }

  /** PUT 请求 */
  put<R, T>(
    url: string,
    data?: R,
    config?: AxiosRequestConfig<R>,
  ): Promise<ResponseData<T>> {
    return this.request<R, T>({ url, method: 'PUT', data, ...config })
  }

  /** DELETE 请求 */
  delete<R, T>(
    url: string,
    data?: R,
    config?: AxiosRequestConfig<R>,
  ): Promise<ResponseData<T>> {
    return this.request<R, T>({ url, method: 'DELETE', data, ...config })
  }

  /** PATCH 请求 */
  patch<R, T>(
    url: string,
    data?: R,
    config?: AxiosRequestConfig<R>,
  ): Promise<ResponseData<T>> {
    return this.request<R, T>({ url, method: 'PATCH', data, ...config })
  }
}

export const request = new Request({
  timeout: 10000, // 超时时间
  headers: {
    'Content-Type': 'application/json',
  },
})
