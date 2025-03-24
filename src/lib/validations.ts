import { z } from 'zod'

export interface ValidationResultError {
  field: string
  message: string
}

export interface ValidationResult {
  success: boolean
  errors?: ValidationResultError[] // 错误信息的结构
}

/**
 * 验证请求数据并返回结果
 * @param schema Zod验证Schema
 * @param data 待验证数据
 * @returns 验证结果，包含成功状态和数据/错误信息
 */
export function validateSchema<T>(
  schema: z.ZodType<T>,
  data: unknown,
): ValidationResult {
  try {
    schema.parse(data)
    return { success: true }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => ({
        field: err.path.join('.'),
        message: err.message,
      }))
      return { success: false, errors: errorMessages }
    }
    return { success: false, errors: [{ field: '', message: '验证失败' }] }
  }
}
