import { Dept as DeptClient } from '@prisma/client'
import { z } from 'zod'

export interface Dept extends DeptClient {
  status: DeptStatus
  children?: Dept[]
  parent?: Dept
}

export enum DeptStatus {
  ENABLED = 1, // 启用
  DISABLED = 2, // 禁用
}

export interface DeptStatusOptions {
  label: string
  value: DeptStatus
  color: string
}

export type CreateDeptDto = Pick<
  Dept,
  'name' | 'parentId' | 'sort' | 'status' | 'email' | 'mobile'
>

export type UpdateDeptDto = Pick<
  Dept,
  'id' | 'name' | 'parentId' | 'sort' | 'status' | 'email' | 'mobile'
>

export type SearchDeptDto = Partial<Pick<Dept, 'name' | 'status'>>
export type DeptTreeVo = Pick<Dept, 'id' | 'name' | 'parentId' | 'sort'>

export const DEPT_STATUS_OPTIONS: DeptStatusOptions[] = [
  {
    label: '启用',
    value: DeptStatus.ENABLED,
    color: 'magenta',
  },
  {
    label: '禁用',
    value: DeptStatus.DISABLED,
    color: 'default',
  },
]

export const DeptSchema = z.object({
  name: z.string().min(1, '部门名不能为空').max(20, '部门名不能超过20个字符'),
  parentId: z.string(),
  sort: z
    .number()
    .min(0, '排序值不能小于0')
    .max(10000, '排序值不能超过10000')
    .optional(),
  status: z.nativeEnum(DeptStatus),
  email: z
    .string()
    .email('邮箱格式不正确')
    .min(5, '邮箱不能小于5个字符')
    .max(100, '邮箱不能超过100个字符')
    .or(z.literal(''))
    .optional(),
  mobile: z
    .string()
    .regex(/^1[3-9]\d{9}$/, '手机号格式不正确')
    .or(z.literal(''))
    .optional(),
})
