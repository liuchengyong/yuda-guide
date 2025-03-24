import { prisma } from '@/lib/prisma'
import { ResponseUtils } from '@/modules/http/response.util'
import { ResponseCode } from '@/types'

/**
 * 权限服务类
 */
export class PermissionService {
  /**
   * 创建权限
   *
   */
  static async createPermission(data: CreatePermissionDto) {
    const existingPermission = await prisma.permission.findFirst({
      where: {
        OR: [
          {
            name: data.name,
            code: data.code,
          },
        ],
      },
    })

    if (existingPermission) {
      ResponseUtils.businessError(
        ResponseCode.PERMISSION_EXISTING,
        'Permission with this name already exists',
      )
    }
    const newPermission = await prisma.permission.create({
      data,
    })
    ResponseUtils.success(newPermission)
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
