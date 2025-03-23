import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
    const { type, name, description } = body

    // 基本验证
    if (!type || !name) {
      return NextResponse.json(
        { error: 'Permission type and name are required' },
        { status: 400 },
      )
    }

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
