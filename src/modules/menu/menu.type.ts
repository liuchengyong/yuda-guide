import { Menu as MenuClient } from '@prisma/client'
import { z } from 'zod'

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
  ENABLED = 1, // 启用
  DISABLED = 2, // 禁用
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

export const MENU_TYPE_OPTIONS: MenuTypeOptions[] = [
  {
    label: '目录',
    value: MenuType.DIR,
    color: 'magenta',
  },
  {
    label: '菜单',
    value: MenuType.MENU,
    color: 'volcano',
  },
  {
    label: '按钮',
    value: MenuType.BUTTON,
    color: 'orange',
  },
]

export const MENU_STATUS_OPTIONS: MenuStatusOptions[] = [
  {
    label: '启用',
    value: MenuStatus.ENABLED,
    color: 'magenta',
  },
  {
    label: '禁用',
    value: MenuStatus.DISABLED,
    color: 'default',
  },
]

export const MenuSchema = z.object({
  name: z.string().min(1, '菜单名不能为空').max(20, '菜单名不能超过20个字符'),
  path: z.string().max(200, '路径不能超过200个字符').optional(),
  type: z.nativeEnum(MenuType),
  icon: z.string().max(200, '图标路径不能超过200个字符').optional(),
  code: z
    .string()
    .min(1, '权限编码不能为空')
    .max(300, '权限编码不能超过300个字符')
    .optional(),
  parentId: z.string(),
  sort: z
    .number()
    .min(0, '排序值不能小于0')
    .max(10000, '排序值不能超过10000')
    .optional(),
  status: z.nativeEnum(MenuStatus),
  visible: z.boolean(),
})
