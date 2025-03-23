import { prisma } from '@/lib/prisma'
import { Tag } from '@/types/tag'
import { BaseService } from './base.service'

/**
 * 标签服务类
 */
export class TagService extends BaseService<Tag> {
  constructor() {
    // 定义标签查询时的默认字段选择
    const selectFields = {
      id: true,
      name: true,
      color: true,
      createdTime: true,
      updatedTime: true,
      sites: {
        select: {
          site: {
            select: {
              id: true,
              url: true,
              logo: true,
              name: true,
              description: true,
            },
          },
        },
      },
    }

    super('tag', selectFields)
  }

  /**
   * 格式化标签数据，将sites数组转换为更简洁的格式
   */
  formatTag(tag: any) {
    if (!tag) return null

    return {
      ...tag,
      sites: tag.sites?.map((ts: any) => ts.site) || [],
    }
  }

  /**
   * 格式化标签列表数据
   */
  formatTags(tags: any[]) {
    return tags.map(this.formatTag)
  }

  /**
   * 重写findAll方法，添加格式化逻辑
   */
  async findAll(options: any = {}) {
    const tags = await super.findAll(options)
    return this.formatTags(tags)
  }

  /**
   * 重写findById方法，添加格式化逻辑
   */
  async findById(id: string, options: any = {}) {
    const tag = await super.findById(id, options)
    return this.formatTag(tag)
  }

  /**
   * 创建标签
   */
  async createTag(data: Partial<Tag> & { sites?: string[] }) {
    const { sites, ...tagData } = data

    // 检查标签名是否已存在
    const existingTag = await prisma.tag.findUnique({
      where: { name: tagData.name },
    })

    if (existingTag) {
      throw new Error('Tag with this name already exists')
    }

    // 创建标签
    const tag = await prisma.tag.create({
      data: tagData,
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

    return tag
  }

  /**
   * 更新标签
   */
  async updateTag(id: string, data: Partial<Tag> & { sites?: string[] }) {
    const { sites, ...tagData } = data

    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    })

    if (!existingTag) {
      throw new Error('Tag not found')
    }

    // 如果更新标签名，检查是否与其他标签冲突
    if (tagData.name && tagData.name !== existingTag.name) {
      const conflictTag = await prisma.tag.findUnique({
        where: { name: tagData.name },
      })

      if (conflictTag) {
        throw new Error('Tag with this name already exists')
      }
    }

    // 更新标签基本信息
    const updatedTag = await prisma.tag.update({
      where: { id },
      data: tagData,
    })

    // 如果提供了站点，则更新标签-站点关联
    if (sites) {
      // 先删除现有的站点关联
      await prisma.siteTag.deleteMany({
        where: { tagId: id },
      })

      // 创建新的站点关联
      if (Array.isArray(sites) && sites.length > 0) {
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

    return updatedTag
  }

  /**
   * 删除标签
   */
  async deleteTag(id: string) {
    // 检查标签是否存在
    const existingTag = await prisma.tag.findUnique({
      where: { id },
    })

    if (!existingTag) {
      throw new Error('Tag not found')
    }

    // 删除标签（关联的标签-站点记录会通过级联删除自动删除）
    return prisma.tag.delete({
      where: { id },
    })
  }
}

// 导出单例实例
export const tagService = new TagService()
