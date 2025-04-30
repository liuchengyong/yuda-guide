import { PostService } from '@/modules/post/post.service'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return PostService.getList(request)
}
