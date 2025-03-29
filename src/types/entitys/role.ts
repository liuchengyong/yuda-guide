import { BaseEntity } from '../base.entity'
import { Permission } from '../../modules/permission/permission.model'
import { User, UserRole } from '../user'

// 角色实体
export interface Role extends BaseEntity {
  name: string
  description?: string
  users?: UserRole[]
  permissions?: RolePermission[]
}

// 角色-权限关联
export interface RolePermission {
  roleId: string
  permissionId: string
  createdTime: Date
  updatedTime: Date
  role?: Role
  permission?: Permission
}
