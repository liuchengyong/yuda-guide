import { z } from 'zod'

/**
 * 标签验证Schema
 */
export const tagSchema = z.object({
  name: z
    .string()
    .min(1, { message: '标签名称不能为空' })
    .max(50, { message: '标签名称不能超过50个字符' }),
  description: z
    .string()
    .max(200, { message: '标签描述不能超过200个字符' })
    .optional(),
  sites: z.array(z.string().uuid({ message: '无效的站点ID' })).optional(),
})

/**
 * 标签更新验证Schema
 */
export const tagUpdateSchema = z.object({
  name: z
    .string()
    .min(1, { message: '标签名称不能为空' })
    .max(50, { message: '标签名称不能超过50个字符' })
    .optional(),
  description: z
    .string()
    .max(200, { message: '标签描述不能超过200个字符' })
    .optional(),
  sites: z.array(z.string().uuid({ message: '无效的站点ID' })).optional(),
})

/**
 * 站点验证Schema
 */
export const siteSchema = z.object({
  name: z
    .string()
    .min(1, { message: '站点名称不能为空' })
    .max(100, { message: '站点名称不能超过100个字符' }),
  url: z.string().url({ message: '请输入有效的URL' }),
  description: z
    .string()
    .max(500, { message: '站点描述不能超过500个字符' })
    .optional(),
  logo: z.string().optional(),
  categoryId: z.string().uuid({ message: '无效的分类ID' }),
  tags: z.array(z.string().uuid({ message: '无效的标签ID' })).optional(),
})

/**
 * 站点更新验证Schema
 */
export const siteUpdateSchema = z.object({
  name: z
    .string()
    .min(1, { message: '站点名称不能为空' })
    .max(100, { message: '站点名称不能超过100个字符' })
    .optional(),
  url: z.string().url({ message: '请输入有效的URL' }).optional(),
  description: z
    .string()
    .max(500, { message: '站点描述不能超过500个字符' })
    .optional(),
  logo: z.string().optional(),
  categoryId: z.string().uuid({ message: '无效的分类ID' }).optional(),
  tags: z.array(z.string().uuid({ message: '无效的标签ID' })).optional(),
})

/**
 * 分类验证Schema
 */
export const categorySchema = z.object({
  name: z
    .string()
    .min(1, { message: '分类名称不能为空' })
    .max(50, { message: '分类名称不能超过50个字符' }),
  description: z
    .string()
    .max(200, { message: '分类描述不能超过200个字符' })
    .optional(),
})

/**
 * 分类更新验证Schema
 */
export const categoryUpdateSchema = z.object({
  name: z
    .string()
    .min(1, { message: '分类名称不能为空' })
    .max(50, { message: '分类名称不能超过50个字符' })
    .optional(),
  description: z
    .string()
    .max(200, { message: '分类描述不能超过200个字符' })
    .optional(),
})

/**
 * 用户验证Schema
 */
export const userSchema = z.object({
  username: z
    .string()
    .min(3, { message: '用户名至少需要3个字符' })
    .max(50, { message: '用户名不能超过50个字符' }),
  password: z.string().min(6, { message: '密码至少需要6个字符' }),
  email: z.string().email({ message: '请输入有效的邮箱地址' }),
  roleId: z.string().uuid({ message: '无效的角色ID' }).optional(),
})

/**
 * 用户更新验证Schema
 */
export const userUpdateSchema = z.object({
  username: z
    .string()
    .min(3, { message: '用户名至少需要3个字符' })
    .max(50, { message: '用户名不能超过50个字符' })
    .optional(),
  password: z.string().min(6, { message: '密码至少需要6个字符' }).optional(),
  email: z.string().email({ message: '请输入有效的邮箱地址' }).optional(),
  roleId: z.string().uuid({ message: '无效的角色ID' }).optional(),
})

/**
 * 角色验证Schema
 */
export const roleSchema = z.object({
  name: z
    .string()
    .min(1, { message: '角色名称不能为空' })
    .max(50, { message: '角色名称不能超过50个字符' }),
  description: z
    .string()
    .max(200, { message: '角色描述不能超过200个字符' })
    .optional(),
  permissions: z.array(z.string().uuid({ message: '无效的权限ID' })).optional(),
})

/**
 * 角色更新验证Schema
 */
export const roleUpdateSchema = z.object({
  name: z
    .string()
    .min(1, { message: '角色名称不能为空' })
    .max(50, { message: '角色名称不能超过50个字符' })
    .optional(),
  description: z
    .string()
    .max(200, { message: '角色描述不能超过200个字符' })
    .optional(),
  permissions: z.array(z.string().uuid({ message: '无效的权限ID' })).optional(),
})

/**
 * 权限验证Schema
 */
export const permissionSchema = z.object({
  name: z
    .string()
    .min(1, { message: '权限名称不能为空' })
    .max(50, { message: '权限名称不能超过50个字符' }),
  type: z.enum(['system', 'custom'], {
    message: '权限类型必须是system或custom',
  }),
  description: z
    .string()
    .max(200, { message: '权限描述不能超过200个字符' })
    .optional(),
})

/**
 * 权限更新验证Schema
 */
export const permissionUpdateSchema = z.object({
  name: z
    .string()
    .min(1, { message: '权限名称不能为空' })
    .max(50, { message: '权限名称不能超过50个字符' })
    .optional(),
  type: z
    .enum(['system', 'custom'], { message: '权限类型必须是system或custom' })
    .optional(),
  description: z
    .string()
    .max(200, { message: '权限描述不能超过200个字符' })
    .optional(),
})

/**
 * 验证请求数据并返回结果
 * @param schema Zod验证Schema
 * @param data 待验证数据
 * @returns 验证结果，包含成功状态和数据/错误信息
 */
export function validateData<T>(schema: z.ZodType<T>, data: unknown) {
  try {
    const validData = schema.parse(data)
    return { success: true, data: validData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errorMessages = error.errors.map((err) => ({
        path: err.path.join('.'),
        message: err.message,
      }))
      return { success: false, error: errorMessages }
    }
    return { success: false, error: [{ path: '', message: '验证失败' }] }
  }
}
