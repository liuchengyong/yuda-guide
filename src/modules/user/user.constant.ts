import { z } from 'zod'
import { UserStatus, UserStatusConfig } from './user.model'

/**
 * 用户状态配置
 */
export const USER_STATUS_CONFIG: UserStatusConfig[] = [
  {
    label: '禁用',
    value: UserStatus.Disabled,
    color: 'danger',
  },
  {
    label: '启用',
    value: UserStatus.Enabled,
    color: 'success',
  },
]

/**
 * 用户验证模式
 */
export const UserSchema = z.object({
  id: z.string().optional(),
  username: z.string().min(3, { message: '用户名至少为3个字符' }),
  password: z.string().min(6, { message: '密码至少为6个字符' }).optional(),
  email: z.string().email({ message: '邮箱格式不正确' }).optional(),
  phone: z
    .string()
    .regex(/^1[3-9]\d{9}$/, { message: '手机号格式不正确' })
    .optional(),
  nickname: z.string().optional(),
  avatar: z.string().optional(),
  status: z.number().int().default(1),
})

/**
 * 用户登录验证模式
 */
export const LoginSchema = z.object({
  username: z.string().min(3, { message: '用户名至少为3个字符' }),
  password: z.string().min(6, { message: '密码至少为6个字符' }),
})

/**
 * 密码更新验证模式
 */
export const UpdatePasswordSchema = z.object({
  id: z.string(),
  oldPassword: z.string().min(6, { message: '旧密码至少为6个字符' }),
  newPassword: z.string().min(6, { message: '新密码至少为6个字符' }),
})
