import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { permissionSchema, validateData } from '@/lib/validations'

// 获取所有权限
export async function GET(request: NextRequest) {
  try {
    const permissions = await prisma.permission.findMany({
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        createdTime: true,
        updatedTime: true,
      },
    })

    return NextResponse.json(permissions)
  } catch (error) {
    console.error('Error fetching permissions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permissions' },
      { status: 500 },
    )
  }
}

// 创建权限
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 使用Zod验证请求数据
    const validation = validateData(permissionSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { type, name, description } = validation.data

    // 检查权限名是否已存在
    const existingPermission = await prisma.permission.findUnique({
      where: { name },
    })

    if (existingPermission) {
      return NextResponse.json(
        { error: 'Permission with this name already exists' },
        { status: 409 },
      )
    }

    // 创建权限
    const permission = await prisma.permission.create({
      data: {
        type,
        name,
        description,
      },
    })

    return NextResponse.json(permission, { status: 201 })
  } catch (error) {
    console.error('Error creating permission:', error)
    return NextResponse.json(
      { error: 'Failed to create permission' },
      { status: 500 },
    )
  }
}
