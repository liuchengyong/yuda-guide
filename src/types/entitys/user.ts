import { BaseEntity } from './entitys/base'
import { Role } from './entitys/role'

// 用户实体
export interface User extends BaseEntity {
  account: string
  password: string
  avatar?: string
  email: string
  roles?: UserRole[]
}

// 用户-角色关联
export interface UserRole extends BaseEntity {
  userId: string
  roleId: string
  user?: User
  role?: Role
}
