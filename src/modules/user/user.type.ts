import { User } from '@prisma/client'
import { z } from 'zod'
import { Status } from '../common/base.type'
import { PagenationParam } from '../http/http.type'

export interface UserBo extends Omit<User, 'status'> {
  status: Status
  roleIds: string[]
  confirmPassword: string
}
export type UserVo = Pick<
  UserBo,
  | 'id'
  | 'account'
  | 'avatar'
  | 'email'
  | 'status'
  | 'updatedTime'
  | 'createdTime'
>

export type CreateUserDto = Pick<
  UserBo,
  | 'account'
  | 'password'
  | 'confirmPassword'
  | 'avatar'
  | 'email'
  | 'status'
  | 'roleIds'
>

export type UpdateUserDto = Pick<
  UserBo,
  'account' | 'avatar' | 'email' | 'status' | 'roleIds'
>

export type SearchUserDto = Partial<User> & PagenationParam

export const BaseUserSchema = z.object({
  id: z.string(),
  account: z
    .string()
    .min(3, { message: '用户名至少为3个字符' })
    .max(20, { message: '用户名最多为20个字符' }),
  password: z
    .string()
    .min(6, { message: '密码至少为6个字符' })
    .max(20, { message: '密码最多为20个字符' }),
  confirmPassword: z
    .string()
    .min(6, { message: '密码至少为6个字符' })
    .max(20, { message: '密码最多为20个字符' }),
  email: z.string().email({ message: '邮箱格式不正确' }),
  avatar: z.string().nullable(),
  status: z.nativeEnum(Status),
  roleIds: z.array(z.string()),
})

export const CreateUserSchema = BaseUserSchema.pick({
  account: true,
  password: true,
  confirmPassword: true,
  email: true,
  avatar: true,
  status: true,
  roleIds: true,
}).refine((data) => data.password === data.confirmPassword, {
  path: ['confirmPassword'],
  message: '两次输入的密码不一致',
})

export const UserUpdateSchema = BaseUserSchema.pick({
  account: true,
  email: true,
  avatar: true,
  status: true,
})
