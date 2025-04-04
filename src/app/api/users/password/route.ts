import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/modules/user/user.service'

/**
 * 处理PUT请求，修改用户密码
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  return await UserService.updatePassword(request)
}
