import { Permission } from '@prisma/client'
import { User } from '../user/user.model'

// 角色状态
export enum RoleStatus {
  Disabled = 0,
  Enabled = 1,
}

// 角色状态配置
export interface RoleStatusConfig {
  label: string
  value: RoleStatus
  color: string
}

export interface RolePermission {
  id: string
  permissionId: string
  roleId: string
  createdTime: Date
  updatedTime: Date
  permission: Permission
  role: Role
}

export interface UserRole {
  id: string
  userId: string
  roleId: string
  createdTime: Date
  updatedTime: Date
  user: User
  role: Role
}

// 角色实体
export interface Role {
  id: string
  name: string
  description: string
  status: RoleStatus
  createdTime: Date
  updatedTime: Date
  rolePermissions?: RolePermission[]
  userRoles?: UserRole[]
  permissionIds?: string[]
}

export type GetRoleDto = Partial<Role> & {
  page: number
  pageSize: number
}

// 创建角色DTO
export type CreateRoleDto = Pick<
  Role,
  'name' | 'description' | 'status' | 'permissionIds'
>

// 更新角色DTO
export type UpdateRoleDto = Pick<
  Role,
  'name' | 'description' | 'status' | 'permissionIds'
>
