import { NextRequest, NextResponse } from 'next/server'
import { RoleService } from '@/modules/role/role.service'

/**
 * 处理POST请求，分配角色权限
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return await RoleService.assignPermissions(request)
}
