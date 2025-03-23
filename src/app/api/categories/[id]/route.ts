import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取单个分类
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id

    const category = await prisma.category.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        description: true,
        parentId: true,
        createdTime: true,
        updatedTime: true,
        parent: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        children: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        sites: {
          select: {
            site: {
              select: {
                id: true,
                name: true,
                url: true,
              },
            },
          },
        },
      },
    })

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // 格式化返回数据
    const formattedCategory = {
      ...category,
      sites: category.sites.map((cs) => cs.site),
    }

    return NextResponse.json(formattedCategory)
  } catch (error) {
    console.error('Error fetching category:', error)
    return NextResponse.json(
      { error: 'Failed to fetch category' },
      { status: 500 },
    )
  }
}

// 更新分类
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id
    const body = await request.json()
    const { name, description, parentId, sites } = body

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // 如果提供了parentId，检查父分类是否存在
    if (parentId && parentId !== existingCategory.parentId) {
      // 检查是否形成循环引用（不能将自己或子分类设为父分类）
      if (parentId === id) {
        return NextResponse.json(
          { error: 'Category cannot be its own parent' },
          { status: 400 },
        )
      }

      const parentCategory = await prisma.category.findUnique({
        where: { id: parentId },
      })

      if (!parentCategory) {
        return NextResponse.json(
          { error: 'Parent category not found' },
          { status: 404 },
        )
      }
    }

    // 更新分类基本信息
    const updateData: any = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description
    if (parentId !== undefined) updateData.parentId = parentId

    const updatedCategory = await prisma.category.update({
      where: { id },
      data: updateData,
    })

    // 如果提供了站点，更新分类站点
    if (sites && Array.isArray(sites)) {
      // 删除现有站点关联
      await prisma.categorySite.deleteMany({
        where: { categoryId: id },
      })

      // 创建新的站点关联
      if (sites.length > 0) {
        await Promise.all(
          sites.map((siteId) =>
            prisma.categorySite.create({
              data: {
                categoryId: id,
                siteId,
              },
            }),
          ),
        )
      }
    }

    return NextResponse.json(updatedCategory)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Failed to update category' },
      { status: 500 },
    )
  }
}

// 删除分类
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 })
    }

    // 删除分类 (关联的CategorySite记录会通过级联删除自动删除)
    await prisma.category.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Category deleted successfully' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Failed to delete category' },
      { status: 500 },
    )
  }
}
