import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取单个权限
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id

    const permission = await prisma.permission.findUnique({
      where: { id },
      select: {
        id: true,
        type: true,
        name: true,
        description: true,
        createdTime: true,
        updatedTime: true,
      },
    })

    if (!permission) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 },
      )
    }

    return NextResponse.json(permission)
  } catch (error) {
    console.error('Error fetching permission:', error)
    return NextResponse.json(
      { error: 'Failed to fetch permission' },
      { status: 500 },
    )
  }
}

// 更新权限
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id
    const body = await request.json()
    const { type, name, description } = body

    // 检查权限是否存在
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    })

    if (!existingPermission) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 },
      )
    }

    // 如果更新名称，检查是否与其他权限冲突
    if (name && name !== existingPermission.name) {
      const conflictPermission = await prisma.permission.findUnique({
        where: { name },
      })

      if (conflictPermission) {
        return NextResponse.json(
          { error: 'Permission name already in use' },
          { status: 409 },
        )
      }
    }

    // 更新权限基本信息
    const updateData: any = {}
    if (type) updateData.type = type
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description

    const updatedPermission = await prisma.permission.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json(updatedPermission)
  } catch (error) {
    console.error('Error updating permission:', error)
    return NextResponse.json(
      { error: 'Failed to update permission' },
      { status: 500 },
    )
  }
}

// 删除权限
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id

    // 检查权限是否存在
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    })

    if (!existingPermission) {
      return NextResponse.json(
        { error: 'Permission not found' },
        { status: 404 },
      )
    }

    // 删除权限 (关联的RolePermission记录会通过级联删除自动删除)
    await prisma.permission.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Permission deleted successfully' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error deleting permission:', error)
    return NextResponse.json(
      { error: 'Failed to delete permission' },
      { status: 500 },
    )
  }
}
