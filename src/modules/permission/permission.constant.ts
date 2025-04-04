import { z } from 'zod'
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
    label: '元素',
    value: PermissionType.Element,
    color: 'purple',
    startWith: 'element',
  },
]

/**
 * 权限验证
 */
export const PermissionSchema = z
  .object({
    type: z.nativeEnum(PermissionType),
    name: z
      .string()
      .min(1, '权限名不能为空')
      .max(100, '权限名不能超过100个字符'),
    code: z
      .string()
      .min(1, '权限编码不能为空')
      .max(300, '权限编码不能超过300个字符'),
    sort: z.number().min(0, '排序值不能小于0').max(200, '排序值不能超过200'),
    description: z.string().max(200, '描述不能超过200个字符').optional(),
    path: z.string().max(200, '路径不能超过200个字符').optional(),
    icon: z.string().max(200, '图标不能超过200个字符').optional(),
    parentId: z.string().min(1, '父级ID不能为空'),
  })
  .superRefine((data, ctx) => {
    let config = PERMISSION_TYPE_OPTIONS.find(
      (item) => item.value === data.type,
    )
    if (config && !data.code.startsWith(config.startWith)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `权限编码格式错误,必须以${config.startWith}开头`,
        path: ['code'],
      })
    }
  })
