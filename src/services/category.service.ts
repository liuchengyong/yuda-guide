import { prisma } from '@/lib/prisma'
import { Category } from '@/types/category'
import { BaseService } from './base.service'

/**
 * 分类服务类
 */
export class CategoryService extends BaseService<Category> {
  constructor() {
    // 定义分类查询时的默认字段选择
    const selectFields = {
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
              url: true,
              logo: true,
              name: true,
              description: true,
            },
          },
        },
      },
    }

    super('category', selectFields)
  }

  /**
   * 格式化分类数据，将sites数组转换为更简洁的格式
   */
  formatCategory(category: any) {
    if (!category) return null

    return {
      ...category,
      sites: category.sites?.map((cs: any) => cs.site) || [],
    }
  }

  /**
   * 格式化分类列表数据
   */
  formatCategories(categories: any[]) {
    return categories.map(this.formatCategory)
  }

  /**
   * 重写findAll方法，添加格式化逻辑
   */
  async findAll(options: any = {}) {
    const categories = await super.findAll(options)
    return this.formatCategories(categories)
  }

  /**
   * 重写findById方法，添加格式化逻辑
   */
  async findById(id: string, options: any = {}) {
    const category = await super.findById(id, options)
    return this.formatCategory(category)
  }

  /**
   * 创建分类
   */
  async createCategory(data: Partial<Category> & { sites?: string[] }) {
    const { sites, ...categoryData } = data

    // 检查分类名是否已存在
    const existingCategory = await prisma.category.findUnique({
      where: { name: categoryData.name },
    })

    if (existingCategory) {
      throw new Error('Category with this name already exists')
    }

    // 创建分类
    const category = await prisma.category.create({
      data: categoryData,
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

    return category
  }

  /**
   * 更新分类
   */
  async updateCategory(
    id: string,
    data: Partial<Category> & { sites?: string[] },
  ) {
    const { sites, ...categoryData } = data

    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      throw new Error('Category not found')
    }

    // 如果更新分类名，检查是否与其他分类冲突
    if (categoryData.name && categoryData.name !== existingCategory.name) {
      const conflictCategory = await prisma.category.findUnique({
        where: { name: categoryData.name },
      })

      if (conflictCategory) {
        throw new Error('Category with this name already exists')
      }
    }

    // 更新分类基本信息
    const updatedCategory = await prisma.category.update({
      where: { id },
      data: categoryData,
    })

    // 如果提供了站点，则更新分类-站点关联
    if (sites) {
      // 先删除现有的站点关联
      await prisma.categorySite.deleteMany({
        where: { categoryId: id },
      })

      // 创建新的站点关联
      if (Array.isArray(sites) && sites.length > 0) {
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

    return updatedCategory
  }

  /**
   * 删除分类
   */
  async deleteCategory(id: string) {
    // 检查分类是否存在
    const existingCategory = await prisma.category.findUnique({
      where: { id },
    })

    if (!existingCategory) {
      throw new Error('Category not found')
    }

    // 删除分类（关联的分类-站点记录会通过级联删除自动删除）
    return prisma.category.delete({
      where: { id },
    })
  }
}

// 导出单例实例
export const categoryService = new CategoryService()
