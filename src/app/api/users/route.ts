import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/services'

// 获取所有用户
export async function GET(request: NextRequest) {
  try {
    const users = await userService.findAll()
    return NextResponse.json(users)
  } catch (error) {
    console.error('Error fetching users:', error)
    return NextResponse.json(
      { error: 'Failed to fetch users' },
      { status: 500 },
    )
  }
}

// 创建用户
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { account, password, email, avatar, roles } = body

    // 基本验证
    if (!account || !password || !email) {
      return NextResponse.json(
        { error: 'Account, password and email are required' },
        { status: 400 },
      )
    }

    // 创建用户
    const user = await userService.createUser({
      account,
      password, // 注意：实际应用中应该对密码进行哈希处理
      email,
      avatar,
      roles,
    })

    return NextResponse.json(user, { status: 201 })
  } catch (error) {
    console.error('Error creating user:', error)
    return NextResponse.json(
      { error: 'Failed to create user' },
      { status: 500 },
    )
  }
}
