import { z } from 'zod'
import { RoleStatus, RoleStatusConfig } from './role.model'

/**
 * 角色状态配置
 */
export const ROLE_STATUS_CONFIG: RoleStatusConfig[] = [
  {
    label: '禁用',
    value: RoleStatus.Disabled,
    color: 'default',
  },
  {
    label: '启用',
    value: RoleStatus.Enabled,
    color: 'success',
  },
]

/**
 * 角色验证模式
 */
export const RoleSchema = z.object({
  name: z.string().min(2, { message: '角色名称至少为2个字符' }),
  description: z.string().optional(),
  status: z.number().int().default(1),
  permissionIds: z.array(z.string()).optional(),
})
