import { Button } from 'antd'
import { z } from 'zod'
import { BaseEntity } from '@/types/base.entity'
import { RolePermission } from '@/types/entitys/role'

export enum PermissionType {
  Module = 'module', // 模块
  Page = 'page', // 页面
  Api = 'api', // api
  Button = 'button', // 按钮
}

// 权限实体
export interface Permission extends BaseEntity {
  type: PermissionType
  name: string
  code: string
  description: string
  roles: RolePermission[]
}

export const PermissionSchema = z.object({
  type: z.nativeEnum(PermissionType),
  name: z.string().min(1, '').max(100),
  code: z.string().min(1).max(300),
  description: z.string(),
})

export type CreatePermissionDto = Pick<
  Permission,
  'type' | 'name' | 'code' | 'description'
>

export type CreatePermissionVo = {
  id: string
}

export const CreatePermissionDtoSchema = PermissionSchema.pick({
  type: true,
  name: true,
  code: true,
  description: true,
})
