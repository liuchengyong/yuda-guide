import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { siteSchema, validateData } from '@/lib/validations'

// 获取所有站点
export async function GET(request: NextRequest) {
  try {
    const sites = await prisma.site.findMany({
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

    // 格式化返回数据
    const formattedSites = sites.map((site) => ({
      ...site,
      tags: site.tags.map((st) => st.tag),
      categories: site.categories.map((cs) => cs.category),
    }))

    return NextResponse.json(formattedSites)
  } catch (error) {
    console.error('Error fetching sites:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sites' },
      { status: 500 },
    )
  }
}

// 创建站点
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // 使用Zod验证请求数据
    const validation = validateData(siteSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { url, logo, name, description, tags, categories } = validation.data

    // 创建站点
    const site = await prisma.site.create({
      data: {
        url,
        logo,
        name,
        description,
      },
    })

    // 如果提供了标签，则创建站点-标签关联
    if (tags && Array.isArray(tags) && tags.length > 0) {
      await Promise.all(
        tags.map((tagId) =>
          prisma.siteTag.create({
            data: {
              siteId: site.id,
              tagId,
            },
          }),
        ),
      )
    }

    // 如果提供了分类，则创建站点-分类关联
    if (categories && Array.isArray(categories) && categories.length > 0) {
      await Promise.all(
        categories.map((categoryId) =>
          prisma.categorySite.create({
            data: {
              siteId: site.id,
              categoryId,
            },
          }),
        ),
      )
    }

    return NextResponse.json(site, { status: 201 })
  } catch (error) {
    console.error('Error creating site:', error)
    return NextResponse.json(
      { error: 'Failed to create site' },
      { status: 500 },
    )
  }
}
