import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/modules/user/user.service'

/**
 * 处理POST请求，用户登录
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return await UserService.login(request)
}
