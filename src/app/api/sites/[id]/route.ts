import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { siteUpdateSchema, validateData } from '@/lib/validations'

// 获取单个站点
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id

    const site = await prisma.site.findUnique({
      where: { id },
      select: {
        id: true,
        url: true,
        logo: true,
        name: true,
        description: true,
        createdTime: true,
        updatedTime: true,
        tags: {
          select: {
            tag: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
        categories: {
          select: {
            category: {
              select: {
                id: true,
                name: true,
                description: true,
              },
            },
          },
        },
      },
    })

    if (!site) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // 格式化返回数据
    const formattedSite = {
      ...site,
      tags: site.tags.map((st) => st.tag),
      categories: site.categories.map((cs) => cs.category),
    }

    return NextResponse.json(formattedSite)
  } catch (error) {
    console.error('Error fetching site:', error)
    return NextResponse.json({ error: 'Failed to fetch site' }, { status: 500 })
  }
}

// 更新站点
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id
    const body = await request.json()

    // 使用Zod验证请求数据
    const validation = validateData(siteUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { url, logo, name, description, tags, categories } = validation.data

    // 检查站点是否存在
    const existingSite = await prisma.site.findUnique({
      where: { id },
    })

    if (!existingSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // 更新站点基本信息
    const updateData: any = {}
    if (url) updateData.url = url
    if (logo !== undefined) updateData.logo = logo
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description

    const updatedSite = await prisma.site.update({
      where: { id },
      data: updateData,
    })

    // 如果提供了标签，更新站点标签
    if (tags && Array.isArray(tags)) {
      // 删除现有标签关联
      await prisma.siteTag.deleteMany({
        where: { siteId: id },
      })

      // 创建新的标签关联
      if (tags.length > 0) {
        await Promise.all(
          tags.map((tagId) =>
            prisma.siteTag.create({
              data: {
                siteId: id,
                tagId,
              },
            }),
          ),
        )
      }
    }

    // 如果提供了分类，更新站点分类
    if (categories && Array.isArray(categories)) {
      // 删除现有分类关联
      await prisma.categorySite.deleteMany({
        where: { siteId: id },
      })

      // 创建新的分类关联
      if (categories.length > 0) {
        await Promise.all(
          categories.map((categoryId) =>
            prisma.categorySite.create({
              data: {
                siteId: id,
                categoryId,
              },
            }),
          ),
        )
      }
    }

    return NextResponse.json(updatedSite)
  } catch (error) {
    console.error('Error updating site:', error)
    return NextResponse.json(
      { error: 'Failed to update site' },
      { status: 500 },
    )
  }
}

// 删除站点
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id

    // 检查站点是否存在
    const existingSite = await prisma.site.findUnique({
      where: { id },
    })

    if (!existingSite) {
      return NextResponse.json({ error: 'Site not found' }, { status: 404 })
    }

    // 删除站点 (关联的SiteTag和CategorySite记录会通过级联删除自动删除)
    await prisma.site.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Site deleted successfully' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error deleting site:', error)
    return NextResponse.json(
      { error: 'Failed to delete site' },
      { status: 500 },
    )
  }
}
