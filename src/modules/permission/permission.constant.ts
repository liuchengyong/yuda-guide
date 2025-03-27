import { PermissionType, PermissionTypeOption } from './permission.model'

/**
 * 权限类型
 */
export const PERMISSION_TYPE_OPTIONS: PermissionTypeOption[] = [
  { label: '模块', value: PermissionType.Module },
  { label: '页面', value: PermissionType.Page },
  { label: 'API', value: PermissionType.Api },
  { label: '按钮', value: PermissionType.Button },
]

export const PERMISSION_TYPE_OPTIONS_COLORS: string[] = [
  '',
  'red',
  'green',
  'blue',
  'orange',
]
