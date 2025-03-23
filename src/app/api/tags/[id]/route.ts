import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { tagUpdateSchema, validateData } from '@/lib/validations'

// 获取单个标签
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id

    const tag = await prisma.tag.findUnique({
      where: { id },
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

    if (!tag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // 格式化返回数据
    const formattedTag = {
      ...tag,
      sites: tag.sites.map((st) => st.site),
    }

    return NextResponse.json(formattedTag)
  } catch (error) {
    console.error('Error fetching tag:', error)
    return NextResponse.json({ error: 'Failed to fetch tag' }, { status: 500 })
  }
}

// 更新标签
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id
    const body = await request.json()

    // 使用Zod验证请求数据
    const validation = validateData(tagUpdateSchema, body)
    if (!validation.success) {
      return NextResponse.json({ error: validation.error }, { status: 400 })
    }

    const { name, description, sites } = validation.data

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // 如果更新名称，检查是否与其他标签冲突
    if (name && name !== existingTag.name) {
      const conflictTag = await prisma.tag.findUnique({
        where: { name },
      })

      if (conflictTag) {
        return NextResponse.json(
          { error: 'Tag name already in use' },
          { status: 409 },
        )
      }
    }

    // 更新标签基本信息
    const updateData: any = {}
    if (name) updateData.name = name
    if (description !== undefined) updateData.description = description

    const updatedTag = await prisma.tag.update({
      where: { id },
      data: updateData,
    })

    // 如果提供了站点，更新标签站点
    if (sites && Array.isArray(sites)) {
      // 删除现有站点关联
      await prisma.siteTag.deleteMany({
        where: { tagId: id },
      })

      // 创建新的站点关联
      if (sites.length > 0) {
        await Promise.all(
          sites.map((siteId) =>
            prisma.siteTag.create({
              data: {
                tagId: id,
                siteId,
              },
            }),
          ),
        )
      }
    }

    return NextResponse.json(updatedTag)
  } catch (error) {
    console.error('Error updating tag:', error)
    return NextResponse.json({ error: 'Failed to update tag' }, { status: 500 })
  }
}

// 删除标签
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } },
) {
  try {
    const id = params.id

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    })

    if (!existingTag) {
      return NextResponse.json({ error: 'Tag not found' }, { status: 404 })
    }

    // 删除标签 (关联的SiteTag记录会通过级联删除自动删除)
    await prisma.tag.delete({
      where: { id },
    })

    return NextResponse.json(
      { message: 'Tag deleted successfully' },
      { status: 200 },
    )
  } catch (error) {
    console.error('Error deleting tag:', error)
    return NextResponse.json({ error: 'Failed to delete tag' }, { status: 500 })
  }
}
