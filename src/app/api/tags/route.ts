import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// 获取所有标签
export async function GET(request: NextRequest) {
  try {
    const tags = await prisma.tag.findMany({
      select: {
        id: true,
        name: true,
        description: true,
        createdTime: true,
        updatedTime: true,
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
    const formattedTags = tags.map((tag) => ({
      ...tag,
      sites: tag.sites.map((st) => st.site),
    }))

    return NextResponse.json(formattedTags)
  } catch (error) {
    console.error('Error fetching tags:', error)
    return NextResponse.json({ error: 'Failed to fetch tags' }, { status: 500 })
  }
}

// 创建标签
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, sites } = body

    // 基本验证
    if (!name) {
      return NextResponse.json(
        { error: 'Tag name is required' },
        { status: 400 },
      )
    }

    // 检查标签名是否已存在
    const existingTag = await prisma.tag.findUnique({
      where: { name },
    })

    if (existingTag) {
      return NextResponse.json(
        { error: 'Tag with this name already exists' },
        { status: 409 },
      )
    }

    // 创建标签
    const tag = await prisma.tag.create({
      data: {
        name,
        description,
      },
    })

    // 如果提供了站点，则创建标签-站点关联
    if (sites && Array.isArray(sites) && sites.length > 0) {
      await Promise.all(
        sites.map((siteId) =>
          prisma.siteTag.create({
            data: {
              tagId: tag.id,
              siteId,
            },
          }),
        ),
      )
    }

    return NextResponse.json(tag, { status: 201 })
  } catch (error) {
    console.error('Error creating tag:', error)
    return NextResponse.json({ error: 'Failed to create tag' }, { status: 500 })
  }
}
