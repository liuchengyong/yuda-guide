import { PostService } from '@/modules/post/post.service'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return PostService.update(request, id)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return PostService.delete(id)
}
