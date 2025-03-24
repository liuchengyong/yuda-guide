import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/services'
import { userSchema, validateData } from '@/lib/validations'
import { ApiUtils } from '@/lib/responseUtils'
import {
  CreateUserRequest,
  UserListResponse,
  UserResponse,
} from '@/types/api-interfaces'

// 获取所有用户
export async function GET(request: NextRequest) {
  try {
    const users = await userService.findAll()
    return ApiUtils.success<UserListResponse>(users, '获取用户列表成功')
  } catch (error) {
    console.error('Error fetching users:', error)
    return ApiUtils.serverError('获取用户列表失败')
  }
}

// 创建用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 使用Zod验证请求数据
    const validation = validateData<CreateUserRequest>(userSchema, body)
    if (!validation.success) {
      return ApiUtils.badRequest(validation.error)
    }

    const { account, password, email, avatar, roles } = validation.data

    // 创建用户
    const user = await userService.createUser({
      account,
      password, // 注意：实际应用中应该对密码进行哈希处理
      email,
      avatar,
      roles,
    })

    return ApiUtils.success<UserResponse>(user, '用户创建成功')
  } catch (error) {
    console.error('Error creating user:', error)
    return ApiUtils.serverError('创建用户失败')
  }
}
