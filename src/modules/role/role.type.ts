import { Role as RoleClient, RoleMenu as RoleMenuClient } from '@prisma/client'
import { Menu } from '../menu/menu.model'

export interface Role extends RoleClient {
  status: RoleStatus
  menus?: RoleMenu[]
}

export interface RoleMenu extends RoleMenuClient {
  menu: Menu
  role: Role
}

export enum RoleStatus {
  ENABLED = 1, // 启用
  DISABLED = 2, // 禁用
}

// 角色状态配置
export interface RoleStatusConfig {
  label: string
  value: RoleStatus
  color: string
}

export type CreateRoleDto = Pick<
  Role,
  'name' | 'code' | 'sort' | 'status' | 'description'
>

export type UpdateRoleDto = Pick<
  Role,
  'id' | 'name' | 'code' | 'sort' | 'status' | 'description'
>

export type SearchRoleDto = Partial<Pick<Role, 'name' | 'code' | 'status'>> & {
  current: number
  pageSize: number
}


/**
 * 角色状态配置
 */
export const ROLE_STATUS_CONFIG: RoleStatusConfig[] = [
  {
    label: '启用',
    value: RoleStatus.ENABLED,
    color: 'magenta',
  },
  {
    label: '禁用',
    value: RoleStatus.DISABLED,
    color: 'default',
  },
]

/**
 * 角色验证模式
 */
export const RoleSchema = z.object({
  name: z.string().min(1, '角色名不能为空').max(20, '角色名不能超过20个字符'),
  code: z
    .string()
    .min(1, '角色编码不能为空')
    .max(300, '角色编码不能超过300个字符'),
  sort: z.number().min(0, '排序值不能小于0').max(10000, '排序值不能超过10000'),
  status: z.nativeEnum(RoleStatus),
  description: z.string().max(1000, '角色描述不能超过1000个字符').optional(),
})
