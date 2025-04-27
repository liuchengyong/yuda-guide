// 导入其他模块的类型
import { Role, UserRole } from '../role/role.model'
// 用户状态
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
  userRoles: UserRole[]
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
