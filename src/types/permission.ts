import { BaseEntity } from './base'
import { Role, RolePermission } from './role'

// 权限实体
export interface Permission extends BaseEntity {
  type: string
  name: string
  description?: string
  roles?: RolePermission[]
}
