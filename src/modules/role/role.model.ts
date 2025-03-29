import { z } from 'zod'
import { BaseEntity } from '@/types/base.entity'
import { RolePermission } from '@/types/entitys/role'
import { UserRole } from '@/types/entitys/user'

// 角色状态
export enum RoleStatus {
  Active = 1, // 正常
  Disabled = 2, // 禁用
}

// 角色状态配置
export interface RoleStatusConfig {
  label: string
  value: RoleStatus
  color: string
}

// 角色实体
export interface Role extends BaseEntity {
  name: string
  description?: string
  status: RoleStatus
  users?: UserRole[]
  permissions?: RolePermission[]
}

// 角色实体验证
export const RoleSchema = z.object({
  name: z
    .string()
    .min(1, '角色名称不能为空')
    .max(100, '角色名称长度不能超过100'),
  description: z.string().optional(),
  status: z.nativeEnum(RoleStatus).default(RoleStatus.Active),
})

// 创建角色请求参数
export type CreateRoleDto = Pick<Role, 'name' | 'description' | 'status'> & {
  permissions?: string[] // 权限ID列表
}

// 更新角色请求参数
export type UpdateRoleDto = Partial<CreateRoleDto>

// 搜索角色请求参数
export type SearchRoleDto = Partial<Pick<Role, 'name' | 'status'>> & {
  page: number
  pageSize: number
}

export const CreateRoleDtoSchema = RoleSchema

export const UpdateRoleDtoSchema = RoleSchema.partial()
