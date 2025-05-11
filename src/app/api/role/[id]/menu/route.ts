import { RoleService } from '@/modules/role/role.service'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params
  return RoleService.updateRoleMenusId(request, id)
}
