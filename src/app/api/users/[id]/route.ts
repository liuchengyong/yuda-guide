import { NextRequest, NextResponse } from 'next/server'
import { userService } from '@/services'
import { userUpdateSchema, validateData } from '@/lib/validations'
import { ApiUtils } from '@/lib/api'

// 获取单个用户
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id
    const user = await userService.findById(id)

    if (!user) {
      return ApiUtils.notFound('用户不存在')
    }

    return ApiUtils.success(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return ApiUtils.serverError('获取用户失败')
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

    // 使用Zod验证请求数据
    const validation = validateData(userUpdateSchema, body)
    if (!validation.success) {
      return ApiUtils.badRequest(validation.error)
    }

    const { account, email, avatar, password, roles } = validation.data

    // 更新用户
    const updatedUser = await userService.updateUser(id, {
      account,
      email,
      avatar,
      password, // 注意：实际应用中应该对密码进行哈希处理
      roles,
    })

    return ApiUtils.success(updatedUser, '用户更新成功')

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

    return ApiUtils.success(updatedUser, '用户更新成功')
  } catch (error) {
    console.error('Error updating user:', error)
    return ApiUtils.serverError('更新用户失败')
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
      return ApiUtils.notFound('用户不存在')
    }

    // 删除用户 (关联的UserRole记录会通过级联删除自动删除)
    await prisma.user.delete({
      where: { id },
    })

    return ApiUtils.success(null, '用户删除成功')
  } catch (error) {
    console.error('Error deleting user:', error)
    return ApiUtils.serverError('删除用户失败')
  }
}
