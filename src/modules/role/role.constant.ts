import { RoleStatus, RoleStatusConfig } from './role.model'

/**
 * 角色状态选项
 */
export const ROLE_STATUS_OPTIONS: RoleStatusConfig[] = [
  {
    label: '正常',
    value: RoleStatus.Active,
    color: 'green',
  },
  {
    label: '禁用',
    value: RoleStatus.Disabled,
    color: 'red',
  },
]
