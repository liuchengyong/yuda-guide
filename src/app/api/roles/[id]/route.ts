import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { roleUpdateSchema, validateData } from '@/lib/validations'

// 获取单个角色
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id

    const role = await prisma.role.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        createdTime: true,
        updatedTime: true,
        permissions: {
          select: {
            permission: {
              select: {
                id: true,
                type: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    })

    if (!role) {
      return ApiUtils.notFound('Role not found')
    }

    // 格式化返回数据
    const formattedRole = {
      ...role,
      permissions: role.permissions.map((rp) => rp.permission),
    }

    return ApiUtils.success(formattedRole)
  } catch (error) {
    console.error('Error fetching role:', error)
    return ApiUtils.serverError('Failed to fetch role')
  }
}

// 更新角色
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id
    const body = await request.json()

    // 使用Zod验证请求数据
    const validation = validateData(roleUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { name, description, permissions } = validation.data

    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id },
    })

    if (!existingRole) {
      return ApiUtils.notFound('角色不存在')
    }

    // 如果更新名称，检查是否与其他角色冲突
    if (name && name !== existingRole.name) {
      const conflictRole = await prisma.role.findUnique({
        where: { name },
      })

      if (conflictRole) {
        return NextResponse.json(
          { error: 'Role name already in use' },
          { status: 409 },
        )
      }
    }

    // 更新角色基本信息
    const updateData: any = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description

    const updatedRole = await prisma.role.update({
      where: { id },
      data: updateData,
    })

    // 如果提供了权限，更新角色权限
    if (permissions && Array.isArray(permissions)) {
      // 删除现有权限关联
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      })

      // 创建新的权限关联
      if (permissions.length > 0) {
        await Promise.all(
          permissions.map((permissionId) =>
            prisma.rolePermission.create({
              data: {
                roleId: id,
                permissionId,
              },
            }),
          ),
        )
      }
    }

    return ApiUtils.success(updatedRole)
  } catch (error) {
    console.error('Error updating role:', error)
    return ApiUtils.serverError('Failed to update role')
  }
}

// 删除角色
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id

    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id },
    })

    if (!existingRole) {
      return ApiUtils.notFound('角色不存在')
    }

    // 删除角色 (关联的RolePermission和UserRole记录会通过级联删除自动删除)
    await prisma.role.delete({
      where: { id },
    })

    return ApiUtils.success({ message: 'Role deleted successfully' })
  } catch (error) {
    console.error('Error deleting role:', error)
    return ApiUtils.serverError('Failed to delete role')
  }
}
