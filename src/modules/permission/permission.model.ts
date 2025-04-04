// 权限类型
export enum PermissionType {
  System, // 系统
  Module, // 模块
  Menu, // 菜单
  Page, // 页面
  Api, // api
  Element, // 元素
}

// 权限类型配置
export interface PermissionTypeConfig {
  label: string
  value: PermissionType
  color: string
  startWith: string
}

// 权限实体
export interface Permission {
  id: string
  type: PermissionType
  name: string
  code: string
  parentId: string
  description: string
  sort: number
  path: string
  icon: string
  createdTime: Date
  updatedTime: Date
  parent: Permission
  // roles: RolePermission[]
  children: Permission[]
}

export type CreatePermissionDto = Pick<
  Permission,
  | 'name'
  | 'code'
  | 'type'
  | 'sort'
  | 'description'
  | 'path'
  | 'icon'
  | 'parentId'
>

export type UpdatePermissionDto = Pick<
  Permission,
  | 'id'
  | 'name'
  | 'code'
  | 'type'
  | 'sort'
  | 'description'
  | 'path'
  | 'icon'
  | 'parentId'
>
