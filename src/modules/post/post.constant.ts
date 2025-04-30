import { z } from 'zod'
import { PostStatus, PostStatusOptions } from './post.model'

export const POST_STATUS_OPTIONS: PostStatusOptions[] = [
  {
    label: '开启',
    value: PostStatus.OPEN,
    color: 'magenta',
  },
  {
    label: '关闭',
    value: PostStatus.CLOSE,
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
