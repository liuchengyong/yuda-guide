import { prisma } from '@/lib/prisma'
import { Site } from '@/types/site'
import { BaseService } from './base.service'

/**
 * 站点服务类
 */
export class SiteService extends BaseService<Site> {
  constructor() {
    // 定义站点查询时的默认字段选择
    const selectFields = {
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
              color: true,
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
    }
    
    super('site', selectFields)
  }

  /**
   * 格式化站点数据，将tags和categories数组转换为更简洁的格式
   */
  formatSite(site: any) {
    if (!site) return null
    
    return {
      ...site,
      tags: site.tags?.map((st: any) => st.tag) || [],
      categories: site.categories?.map((sc: any) => sc.category) || [],
    }
  }

  /**
   * 格式化站点列表数据
   */
  formatSites(sites: any[]) {
    return sites.map(this.formatSite)
  }

  /**
   * 重写findAll方法，添加格式化逻辑
   */
  async findAll(options: any = {}) {
    const sites = await super.findAll(options)
    return this.formatSites(sites)
  }

  /**
   * 重写findById方法，添加格式化逻辑
   */
  async findById(id: string, options: any = {}) {
    const site = await super.findById(id, options)
    return this.formatSite(site)
  }

  /**
   * 创建站点
   */
  async createSite(data: Partial<Site> & { tags?: string[], categories?: string[] }) {
    const { tags, categories, ...siteData } = data
    
    // 创建站点
    const site = await prisma.site.create({
      data: siteData,
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

    return site
  }

  /**
   * 更新站点
   */
  async updateSite(id: string, data: Partial<Site> & { tags?: string[], categories?: string[] }) {
    const { tags, categories, ...siteData } = data

    // 检查站点是否存在
    const existingSite = await prisma.site.findUnique({
      where: { id },
    })

    if (!existingSite) {
      throw new Error('Site not found')
    }

    // 更新站点基本信息
    const updatedSite = await prisma.site.update({
      where: { id },
      data: siteData,
    })

    // 如果提供了标签，则更新站点-标签关联
    if (tags) {
      // 先删除现有的标签关联
      await prisma.siteTag.deleteMany({
        where: { siteId: id },
      })

      // 创建新的标签关联
      if (Array.isArray(tags) && tags.length > 0) {
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

    // 如果提供了分类，则更新站点-分类关联
    if (categories) {
      // 先删除现有的分类关联
      await prisma.categorySite.deleteMany({
        where: { siteId: id },
      })

      // 创建新的分