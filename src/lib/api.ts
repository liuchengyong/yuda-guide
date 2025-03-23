import { ApiCode, ApiResponse } from '@/types/api'
import { NextResponse } from 'next/server'

/**
 * API工具类，用于处理API请求和响应
 */
export class ApiUtils {
  /**
   * 创建成功响应
   * @param data 响应数据
   * @param message 响应消息
   * @returns NextResponse对象
   */
  static success<T = any>(data: T, message = '操作成功'): NextResponse {
    return NextResponse.json({
      code: ApiCode.SUCCESS,
      message,
      data,
    })
  }

  /**
   * 创建错误响应
   * @param code 错误码
   * @param message 错误消息
   * @param status HTTP状态码
   * @returns NextResponse对象
   */
  static error(code: number, message: string, status = code): NextResponse {
    return NextResponse.json(
      {
        code,
        message,
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
    return this.error(ApiCode.BAD_REQUEST, message, ApiCode.BAD_REQUEST)
  }

  /**
   * 创建401错误响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static unauthorized(message = '未授权'): NextResponse {
    return this.error(ApiCode.UNAUTHORIZED, message, ApiCode.UNAUTHORIZED)
  }

  /**
   * 创建403错误响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static forbidden(message = '禁止访问'): NextResponse {
    return this.error(ApiCode.FORBIDDEN, message, ApiCode.FORBIDDEN)
  }

  /**
   * 创建404错误响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static notFound(message = '资源不存在'): NextResponse {
    return this.error(ApiCode.NOT_FOUND, message, ApiCode.NOT_FOUND)
  }

  /**
   * 创建500错误响应
   * @param message 错误消息
   * @returns NextResponse对象
   */
  static serverError(message = '服务器内部错误'): NextResponse {
    return this.error(ApiCode.INTERNAL_ERROR, message, ApiCode.INTERNAL_ERROR)
  }
}
