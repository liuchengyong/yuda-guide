import { PermissionType, PermissionTypeConfig } from './permission.model'

/**
 * 权限类型
 */
export const PERMISSION_TYPE_OPTIONS: PermissionTypeConfig[] = [
  {
    label: '模块',
    value: PermissionType.Module,
    color: 'green',
    startWith: 'module',
  },
  {
    label: '菜单',
    value: PermissionType.Menu,
    color: 'pink',
    startWith: 'menu',
  },
  {
    label: '页面',
    value: PermissionType.Page,
    color: 'blue',
    startWith: 'page',
  },
  {
    label: 'API',
    value: PermissionType.Api,
    color: 'orange',
    startWith: 'api',
  },
  {
    label: '按钮',
    value: PermissionType.Button,
    color: 'purple',
    startWith: 'button',
  },
]
