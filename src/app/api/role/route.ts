import { RoleService } from '@/modules/role/role.service'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return RoleService.create(request)
}
