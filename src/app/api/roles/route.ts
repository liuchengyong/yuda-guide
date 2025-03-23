import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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

    return NextResponse.json(formattedRoles)
  } catch (error) {
    console.error('Error fetching roles:', error)
    return NextResponse.json(
      { error: 'Failed to fetch roles' },
      { status: 500 },
    )
  }
}

// 创建角色
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, permissions } = body

    // 基本验证
    if (!name) {
      return NextResponse.json(
        { error: 'Role name is required' },
        { status: 400 },
      )
    }

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

    return NextResponse.json(role, { status: 201 })
  } catch (error) {
    console.error('Error creating role:', error)
    return NextResponse.json(
      { error: 'Failed to create role' },
      { status: 500 },
    )
  }
}
