import { z } from 'zod'

export enum UserStatus {
  Disabled = 0,
  Enabled = 1,
}

// 用户状态配置
export interface UserStatusConfig {
  label: string
  value: UserStatus
  color: string
}

// 用户实体
export interface User {
  id: string
  account: string
  password: string
  avatar: string
  email: string
  status: UserStatus
  createdTime: Date
  updatedTime: Date
  roleIds: string[]
}

// 用户创建DTO
export type CreateUserDto = Pick<
  User,
  'account' | 'password' | 'email' | 'avatar' | 'status' | 'roleIds'
>

// 用户更新DTO
export type UpdateUserDto = Pick<
  User,
  'account' | 'email' | 'avatar' | 'status' | 'roleIds'
>

export type GetUserDto = Partial<User> & {
  page: number
  pageSize: number
}

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
