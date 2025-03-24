import { NextResponse } from 'next/server'
import { ResponseCode, ResponseStatus } from './http.model'

/**
 * API工具类，用于处理API请求和响应
 */
export class ResponseUtil {
  /**
   * 创建成功响应
   * @param data 响应数据
   * @param message 响应消息
   * @returns NextResponse对象
   */
  static success<T>(data: T, message = '操作成功'): NextResponse {
    return NextResponse.json({
      code: ResponseCode.SUCCESS,
      message,
      data,
    })
  }

  static businessError(code: ResponseCode, message = '业务错误'): NextResponse {
    return NextResponse.json({
      code,
      message,
      data: null,
    })
  }

  /**
   * 创建错误响应
   * @param code 错误码
   * @param message 错误消息
   * @param status HTTP状态码
   * @returns NextResponse对象
   */
  static error(status: ResponseStatus, message: string): NextResponse {
    return NextResponse.json(
      {
        code: ResponseCode.ERROR,
        message: message,
        data: null,
      },
      { status },
    )
  }

  /**
   * 创建400错误响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static badRequest(message = '请求参数错误'): NextResponse {
    return this.error(ResponseStatus.BAD_REQUEST, message)
  }

  /**
   * 创建401错误响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static unauthorized(message = '未授权'): NextResponse {
    return this.error(ResponseStatus.UNAUTHORIZED, message)
  }

  /**
   * 创建403错误响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static forbidden(message = '禁止访问'): NextResponse {
    return this.error(ResponseStatus.FORBIDDEN, message)
  }

  /**
   * 创建404错误响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static notFound(message = '资源不存在'): NextResponse {
    return this.error(ResponseStatus.NOT_FOUND, message)
  }

  /**
   * 创建500错误响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static serverError(message = '服务器内部错误'): NextResponse {
    return this.error(ResponseStatus.INTERNAL_ERROR, message)
  }
}
