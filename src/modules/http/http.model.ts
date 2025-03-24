/**
 * 分页数据接口
 */
export interface PaginatedData<T> {
  code: ResponseCode
  list: T[]
  total: number
  page: number
  pageSize: number
  message: string
}

/**
 * 对象数据接口
 */
export interface ObjectData<T> {
  code: ResponseCode
  message: string
  data: T
}

/**
 * 响应接口
 */
export type ResponseData<T> = PaginatedData<T> | ObjectData<T>

/**
 * 响应状态码枚举
 */
export enum ResponseStatus {
  SUCCESS = 200,
  BAD_REQUEST = 400,
  UNAUTHORIZED = 401,
  FORBIDDEN = 403,
  NOT_FOUND = 404,
  INTERNAL_ERROR = 500,
}

/**
 * 业务code码
 *
 */
export enum ResponseCode {
  SUCCESS = 0,

  ERROR = -1, // 系统错误
  PARAMS_VALID_ERROR = 101, // 参数校验异常

  // 权限相关
  PERMISSION_EXISTING = 10001, // 权限已存在
  PERMISSION_PARAM_ERROR = 10002, // 参数异常
}
