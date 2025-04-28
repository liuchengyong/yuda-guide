export interface Menu {
  id: number
  name: string
  path: string
  type: MenuType
  icon: string
  code: string
  parentId: number | null
  sort: number
  status: MenuStatus
  visible: boolean
  createdTime: Date
  updatedTime: Date

  children?: Menu[]
  parent?: Menu
}

export enum MenuType {
  DIR = 1, // 目录
  MENU = 2, // 菜单
  BUTTON = 3, // 按钮
}

export interface MenuTypeOptions {
  label: string
  value: MenuType
  color: string
}

export enum MenuStatus {
  OPEN = 1, // 开启
  CLOSE = 2, // 关闭
}

export interface MenuStatusOptions {
  label: string
  value: MenuStatus
  color: string
}

export type CreateMenuDto = Pick<
  Menu,
  | 'name'
  | 'path'
  | 'type'
  | 'icon'
  | 'code'
  | 'parentId'
  | 'sort'
  | 'status'
  | 'visible'
>

export type MenuTreeVo = Pick<Menu, 'id' | 'name' | 'parentId'>
