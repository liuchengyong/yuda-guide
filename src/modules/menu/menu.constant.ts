import { z } from 'zod'
import {
  MenuStatus,
  MenuStatusOptions,
  MenuType,
  MenuTypeOptions,
} from './menu.model'

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
    label: '开启',
    value: MenuStatus.OPEN,
    color: 'magenta',
  },
  {
    label: '关闭',
    value: MenuStatus.CLOSE,
    color: '',
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
    .max(300, '权限编码不能超过300个字符'),
  parentId: z.number(),
  sort: z
    .number()
    .min(0, '排序值不能小于0')
    .max(10000, '排序值不能超过10000')
    .optional(),
  status: z.nativeEnum(MenuStatus),
  visible: z.boolean(),
})
