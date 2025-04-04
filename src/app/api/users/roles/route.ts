import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/modules/user/user.service'

/**
 * 处理POST请求，分配用户角色
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  // return await UserService.assignRoles(request)
  return NextResponse.json({ message: 'Hello, world!' })
}

/**
 * 处理GET请求，获取角色列表
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return await RoleService.getRoles(request)
}
