import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/services'

// 获取单个用户
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id
    const user = await userService.findById(id)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 })
  }
}

// 更新用户
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id
    const body = await request.json()
    const { account, email, avatar, password, roles } = body

    // 更新用户
    const updatedUser = await userService.updateUser(id, {
      account,
      email,
      avatar,
      password, // 注意：实际应用中应该对密码进行哈希处理
      roles,
    })

    return NextResponse.json(updatedUser)

    // 如果提供了角色，更新用户角色
    if (roles && Array.isArray(roles)) {
      // 删除现有角色关联
      await prisma.userRole.deleteMany({
        where: { userId: id },
      })

      // 创建新的角色关联
      if (roles.length > 0) {
        await Promise.all(
          roles.map((roleId) =>
            prisma.userRole.create({
              data: {
                userId: id,
                roleId,
              },
            }),
          ),
        )
      }
    }

    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error('Error updating user:', error)
    return NextResponse.json(
      { error: 'Failed to update user' },
      { status: 500 },
    )
  }
}

// 删除用户
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // 删除用户 (关联的UserRole记录会通过级联删除自动删除)
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'User deleted successfully' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Failed to delete user' },
      { status: 500 },
    )
  }
}
