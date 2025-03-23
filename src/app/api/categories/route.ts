import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取所有分类
export async function GET(request: NextRequest) {
  try {
    const categories = await prisma.category.findMany({
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

    // 格式化返回数据
    const formattedCategories = categories.map((category) => ({
      ...category,
      sites: category.sites.map((cs) => cs.site),
    }))

    return NextResponse.json(formattedCategories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 },
    )
  }
}

// 创建分类
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, parentId, sites } = body

    // 基本验证
    if (!name) {
      return NextResponse.json(
        { error: 'Category name is required' },
        { status: 400 },
      )
    }

    // 如果提供了parentId，检查父分类是否存在
    if (parentId) {
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

    // 创建分类
    const category = await prisma.category.create({
      data: {
        name,
        description,
        parentId,
      },
    })

    // 如果提供了站点，则创建分类-站点关联
    if (sites && Array.isArray(sites) && sites.length > 0) {
      await Promise.all(
        sites.map((siteId) =>
          prisma.categorySite.create({
            data: {
              categoryId: category.id,
              siteId,
            },
          }),
        ),
      )
    }

    return NextResponse.json(category, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Failed to create category' },
      { status: 500 },
    )
  }
}
