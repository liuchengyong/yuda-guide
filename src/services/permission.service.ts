import { prisma } from '@/lib/prisma'
import { Permission } from '@/types/permission'
import { BaseService } from './base.service'

/**
 * 权限服务类
 */
export class PermissionService extends BaseService<Permission> {
  constructor() {
    // 定义权限查询时的默认字段选择
    const selectFields = {
      id: true,
      type: true,
      name: true,
      description: true,
      createdTime: true,
      updatedTime: true,
    }

    super('permission', selectFields)
  }

  /**
   * 创建权限
   */
  async createPermission(data: Partial<Permission>) {
    // 检查权限名是否已存在
    const existingPermission = await prisma.permission.findUnique({
      where: { name: data.name },
    })

    if (existingPermission) {
      throw new Error('Permission with this name already exists')
    }

    // 创建权限
    return prisma.permission.create({
      data,
    })
  }

  /**
   * 更新权限
   */
  async updatePermission(id: string, data: Partial<Permission>) {
    // 检查权限是否存在
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    })

    if (!existingPermission) {
      throw new Error('Permission not found')
    }

    // 如果更新权限名，检查是否与其他权限冲突
    if (data.name && data.name !== existingPermission.name) {
      const conflictPermission = await prisma.permission.findUnique({
        where: { name: data.name },
      })

      if (conflictPermission) {
        throw new Error('Permission with this name already exists')
      }
    }

    // 更新权限
    return prisma.permission.update({
      where: { id },
      data,
    })
  }

  /**
   * 删除权限
   */
  async deletePermission(id: string) {
    // 检查权限是否存在
    const existingPermission = await prisma.permission.findUnique({
      where: { id },
    })

    if (!existingPermission) {
      throw new Error('Permission not found')
    }

    // 删除权限（关联的角色-权限记录会通过级联删除自动删除）
    return prisma.permission.delete({
      where: { id },
    })
  }
}

// 导出单例实例
export const permissionService = new PermissionService()
