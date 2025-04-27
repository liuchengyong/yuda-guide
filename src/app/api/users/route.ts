import { NextRequest, NextResponse } from 'next/server'
import { UserService } from '@/modules/user/user.service'

/**
 * 处理GET请求，获取用户列表
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return await UserService.getUsers(request)
}

/**
 * 处理POST请求，创建用户
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return await UserService.createUser(request)
}
