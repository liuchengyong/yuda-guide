import { Menu as MenuClient } from '@prisma/client'

export interface Menu extends MenuClient {
  type: MenuType
  status: MenuStatus
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

export type UpdateMenuDto = Pick<
  Menu,
  | 'id'
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

export type SearchMenuDto = Partial<
  Pick<Menu, 'name' | 'path' | 'type' | 'code' | 'status'>
>

export type MenuTreeVo = Pick<Menu, 'id' | 'name' | 'parentId' | 'sort'>
