import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { roleSchema, validateData } from '@/lib/validations'

// 获取所有角色
export async function GET(request: NextRequest) {
  try {
    const roles = await prisma.role.findMany({
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

    // 格式化返回数据
    const formattedRoles = roles.map((role) => ({
      ...role,
      permissions: role.permissions.map((rp) => rp.permission),
    }))

    return ApiUtils.success(formattedRoles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return ApiUtils.serverError('Failed to fetch roles')
  }
}

// 创建角色
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 使用Zod验证请求数据
    const validation = validateData(roleSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { name, description, permissions } = validation.data

    // 检查角色名是否已存在
    const existingRole = await prisma.role.findUnique({
      where: { name },
    })

    if (existingRole) {
      return NextResponse.json(
        { error: 'Role with this name already exists' },
        { status: 409 },
      )
    }

    // 创建角色
    const role = await prisma.role.create({
      data: {
        name,
        description,
      },
    })

    // 如果提供了权限，则创建角色-权限关联
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      await Promise.all(
        permissions.map((permissionId) =>
          prisma.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId,
            },
          }),
        ),
      )
    }

    return ApiUtils.success(role, 201)
  } catch (error) {
    console.error('Error creating role:', error)
    return ApiUtils.serverError('Failed to create role')
  }
}
