import { Permission } from '@prisma/client'

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
}

// 角色实体
export interface Role {
  id: string
  name: string
  description: string
  status: RoleStatus
  createdTime: Date
  updatedTime: Date
  rolePermissions: RolePermission[]
  // permissions: Permission[]
  // users: []
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
