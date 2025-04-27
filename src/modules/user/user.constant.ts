import { z } from 'zod'
import { UserStatus, UserStatusConfig } from './user.model'

/**
 * 用户状态配置
 */
export const USER_STATUS_CONFIG: UserStatusConfig[] = [
  {
    label: '禁用',
    value: UserStatus.Disabled,
    color: 'default',
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
  account: z.string().min(3, { message: '用户名至少为3个字符' }),
  password: z.string().min(6, { message: '密码至少为6个字符' }),
  email: z.string().email({ message: '邮箱格式不正确' }),
  avatar: z.string().optional(),
  status: z.number().int().default(1),
  roleIds: z.array(z.string()).optional(),
})

export const UserUpdateSchema = UserSchema.pick({
  account: true,
  email: true,
  avatar: true,
  status: true,
})
