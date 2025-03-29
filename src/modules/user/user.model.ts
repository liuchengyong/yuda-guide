import { z } from 'zod'
import { BaseEntity } from '@/types/base.entity'
import { UserRole } from '@/types/entitys/user'

// 用户状态
export enum UserStatus {
  Active = 1, // 正常
  Disabled = 2, // 禁用
}

// 用户状态配置
export interface UserStatusConfig {
  label: string
  value: UserStatus
  color: string
}

// 用户实体
export interface User extends BaseEntity {
  account: string
  password: string
  avatar?: string
  email: string
  status: UserStatus
  roles?: UserRole[]
}

// 用户实体验证
export const UserSchema = z.object({
  account: z.string().min(1, '账号不能为空').max(100, '账号长度不能超过100'),
  password: z
    .string()
    .min(6, '密码长度不能少于6位')
    .max(100, '密码长度不能超过100'),
  email: z.string().email('请输入有效的邮箱'),
  avatar: z.string().optional(),
  status: z.nativeEnum(UserStatus).default(UserStatus.Active),
})

// 创建用户请求参数
export type CreateUserDto = Pick<
  User,
  'account' | 'password' | 'email' | 'avatar' | 'status'
> & {
  roles?: string[] // 角色ID列表
}

// 更新用户请求参数
export type UpdateUserDto = Partial<CreateUserDto>

// 搜索用户请求参数
export type SearchUserDto = Partial<
  Pick<User, 'account' | 'email' | 'status'>
> & {
  page: number
  pageSize: number
}

export const CreateUserDtoSchema = UserSchema

export const UpdateUserDtoSchema = UserSchema.partial()
