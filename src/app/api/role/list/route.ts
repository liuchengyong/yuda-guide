import { RoleService } from '@/modules/role/role.service'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return RoleService.getList(request)
}
