import { DeptService } from '@/modules/dept/dept.service'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return DeptService.update(request, id)
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return DeptService.delete(id)
}
