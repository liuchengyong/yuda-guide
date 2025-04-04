// 导入其他模块的类型
import { Role } from '../role/role.model'

// 用户实体
export interface User {
  id: string
  username: string
  password: string
  email: string
  phone: string
  nickname: string
  avatar: string
  status: number
  lastLoginTime: Date
  createdTime: Date
  updatedTime: Date
  roles: UserRole[]
}

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

// 用户创建DTO
export type CreateUserDto = Pick<
  User,
  'username' | 'password' | 'email' | 'phone' | 'nickname' | 'avatar' | 'status'
>

// 用户更新DTO
export type UpdateUserDto = Pick<
  User,
  'id' | 'email' | 'phone' | 'nickname' | 'avatar' | 'status'
>

// 用户登录DTO
export type LoginUserDto = Pick<User, 'username' | 'password'>

// 用户密码更新DTO
export interface UpdatePasswordDto {
  id: string
  oldPassword: string
  newPassword: string
}

// 用户角色关联
export interface UserRole {
  userId: string
  roleId: string
  user: User
  role: Role
}
