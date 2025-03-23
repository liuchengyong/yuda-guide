import { prisma } from '@/lib/prisma'
import { BaseEntity } from '@/types/base'

/**
 * 基础服务类，提供通用的CRUD操作
 */
export class BaseService<T extends BaseEntity> {
  protected model: any
  protected modelName: string
  protected selectFields: any

  constructor(modelName: string, selectFields: any = {}) {
    this.modelName = modelName
    this.model = (prisma as any)[modelName]
    this.selectFields = selectFields
  }

  /**
   * 获取所有记录
   */
  async findAll(options: any = {}) {
    const { where = {}, orderBy = { createdTime: 'desc' }, ...rest } = options
    return this.model.findMany({
      where,
      orderBy,
      select: this.selectFields,
      ...rest,
    })
  }

  /**
   * 根据ID获取单个记录
   */
  async findById(id: string, options: any = {}) {
    return this.model.findUnique({
      where: { id },
      select: this.selectFields,
      ...options,
    })
  }

  /**
   * 创建记录
   */
  async create(data: Partial<T>) {
    return this.model.create({
      data,
    })
  }

  /**
   * 更新记录
   */
  async update(id: string, data: Partial<T>) {
    return this.model.update({
      where: { id },
      data,
    })
  }

  /**
   * 删除记录
   */
  async delete(id: string) {
    return this.model.delete({
      where: { id },
    })
  }

  /**
   * 批量删除记录
   */
  async deleteMany(ids: string[]) {
    return this.model.deleteMany({
      where: {
        id: {
          in: ids,
        },
      },
    })
  }
}
