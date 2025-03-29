import { Button } from 'antd'
import { z } from 'zod'
import { BaseEntity } from '@/types/base.entity'
import { RolePermission } from '@/types/entitys/role'
// 权限类型
export enum PermissionType {
  Module = 1, // 模块
  Page, // 页面
  Api, // api
  Button, // 按钮
  Menu, // 菜单
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
  createdTime: Date
  updatedTime: Date

  parent: Permission
  roles: RolePermission[]
  children: Permission[]
}

// 权限实体验证
export const PermissionSchema = z.object({
  type: z.nativeEnum(PermissionType),
  name: z.string().min(1, '').max(100),
  code: z.string().min(1).max(300),
  description: z.string(),
})

// 创建权限请求参数
export type CreatePermissionDto = Pick<
  Permission,
  'type' | 'name' | 'code' | 'description'
>

export type SearchPermissionDto = Partial<
  Pick<Permission, 'type' | 'name' | 'code' | 'description' | 'id'>
> & {
  page: number
  pageSize: number
}

export const CreatePermissionDtoSchema = PermissionSchema.pick({
  type: true,
  name: true,
  code: true,
  description: true,
})
