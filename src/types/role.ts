import { BaseEntity } from './base'
import { Permission } from './permission'
import { User, UserRole } from './user'

// 角色实体
export interface Role extends BaseEntity {
  name: string
  description?: string
  users?: UserRole[]
  permissions?: RolePermission[]
}

// 角色-权限关联
export interface RolePermission extends BaseEntity {
  roleId: string
  permissionId: string
  role?: Role
  permission?: Permission
}
