import { Post as PostClient } from '@prisma/client'
import { z } from 'zod'

export interface Post extends PostClient {
  status: PostStatus
}

export enum PostStatus {
  ENABLED = 1, // 启用
  DISABLED = 2, // 禁用
}

export interface PostStatusOptions {
  label: string
  value: PostStatus
  color: string
}

export type CreatePostDto = Pick<
  Post,
  'name' | 'code' | 'sort' | 'status' | 'description'
>

export type UpdatePostDto = Pick<
  Post,
  'id' | 'name' | 'code' | 'sort' | 'status' | 'description'
>

export type SearchPostDto = Partial<Pick<Post, 'name' | 'code' | 'status'>> & {
  current: number
  pageSize: number
}

export const POST_STATUS_OPTIONS: PostStatusOptions[] = [
  {
    label: '启用',
    value: PostStatus.ENABLED,
    color: 'magenta',
  },
  {
    label: '禁用',
    value: PostStatus.DISABLED,
    color: 'default',
  },
]

export const PostSchema = z.object({
  name: z.string().min(1, '岗位名不能为空').max(20, '岗位名不能超过20个字符'),
  code: z
    .string()
    .min(1, '岗位编码不能为空')
    .max(300, '岗位编码不能超过300个字符'),
  sort: z.number().min(0, '排序值不能小于0').max(10000, '排序值不能超过10000'),
  status: z.nativeEnum(PostStatus),
  description: z.string().max(1000, '岗位描述不能超过1000个字符').optional(),
})
