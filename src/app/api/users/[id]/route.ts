import { UserService } from '@/modules/user/user.service'
import { NextRequest } from 'next/server'

// 获取单个分类
export async function GET() {}

// 更新分类
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return UserService.updateUser(id, request)
}

// 删除分类
export async function DELETE() {}
