import { Dept as DeptClient } from '@prisma/client'

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
