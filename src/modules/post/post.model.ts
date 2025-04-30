import { Post as PostClient } from '@prisma/client'
import { number } from 'zod'

export interface Post extends PostClient {
  status: PostStatus
}

export enum PostStatus {
  OPEN = 1, // 开启
  CLOSE = 2, // 关闭
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
