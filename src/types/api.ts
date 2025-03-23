/**
 * API响应基础接口
 */
export interface ApiResponse<T = any> {
  code: number
  message: string
  data: T
}

/**
 * 分页数据接口
 */
export interface PaginatedData<T = any> {
  items: T[]
  total: number
  page: number
  pageSize: number
}

/**
 * API状态码枚举
 */
export enum ApiCode {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}
