import { Post as PostClient } from '@prisma/client'

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
