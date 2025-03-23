import { prisma } from '@/lib/prisma'
import { Role } from '@/types/role'
import { BaseService } from './base.service'

/**
 * 角色服务类
 */
export class RoleService extends BaseService<Role> {
  constructor() {
    // 定义角色查询时的默认字段选择
    const selectFields = {
      id: true,
      name: true,
      description: true,
      createdTime: true,
      updatedTime: true,
      permissions: {
        select: {
          permission: {
            select: {
              id: true,
              type: true,
              name: true,
              description: true,
            },
          },
        },
      },
    }

    super('role', selectFields)
  }

  /**
   * 格式化角色数据，将permissions数组转换为更简洁的格式
   */
  formatRole(role: any) {
    if (!role) return null

    return {
      ...role,
      permissions: role.permissions?.map((rp: any) => rp.permission) || [],
    }
  }

  /**
   * 格式化角色列表数据
   */
  formatRoles(roles: any[]) {
    return roles.map(this.formatRole)
  }

  /**
   * 重写findAll方法，添加格式化逻辑
   */
  async findAll(options: any = {}) {
    const roles = await super.findAll(options)
    return this.formatRoles(roles)
  }

  /**
   * 重写findById方法，添加格式化逻辑
   */
  async findById(id: string, options: any = {}) {
    const role = await super.findById(id, options)
    return this.formatRole(role)
  }

  /**
   * 创建角色
   */
  async createRole(data: Partial<Role> & { permissions?: string[] }) {
    const { permissions, ...roleData } = data

    // 检查角色名是否已存在
    const existingRole = await prisma.role.findUnique({
      where: { name: roleData.name },
    })

    if (existingRole) {
      throw new Error('Role with this name already exists')
    }

    // 创建角色
    const role = await prisma.role.create({
      data: roleData,
    })

    // 如果提供了权限，则创建角色-权限关联
    if (permissions && Array.isArray(permissions) && permissions.length > 0) {
      await Promise.all(
        permissions.map((permissionId) =>
          prisma.rolePermission.create({
            data: {
              roleId: role.id,
              permissionId,
            },
          }),
        ),
      )
    }

    return role
  }

  /**
   * 更新角色
   */
  async updateRole(
    id: string,
    data: Partial<Role> & { permissions?: string[] },
  ) {
    const { permissions, ...roleData } = data

    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id },
    })

    if (!existingRole) {
      throw new Error('Role not found')
    }

    // 如果更新角色名，检查是否与其他角色冲突
    if (roleData.name && roleData.name !== existingRole.name) {
      const conflictRole = await prisma.role.findUnique({
        where: { name: roleData.name },
      })

      if (conflictRole) {
        throw new Error('Role with this name already exists')
      }
    }

    // 更新角色基本信息
    const updatedRole = await prisma.role.update({
      where: { id },
      data: roleData,
    })

    // 如果提供了权限，则更新角色-权限关联
    if (permissions) {
      // 先删除现有的权限关联
      await prisma.rolePermission.deleteMany({
        where: { roleId: id },
      })

      // 创建新的权限关联
      if (Array.isArray(permissions) && permissions.length > 0) {
        await Promise.all(
          permissions.map((permissionId) =>
            prisma.rolePermission.create({
              data: {
                roleId: id,
                permissionId,
              },
            }),
          ),
        )
      }
    }

    return updatedRole
  }

  /**
   * 删除角色
   */
  async deleteRole(id: string) {
    // 检查角色是否存在
    const existingRole = await prisma.role.findUnique({
      where: { id },
    })

    if (!existingRole) {
      throw new Error('Role not found')
    }

    // 删除角色（关联的角色-权限记录会通过级联删除自动删除）
    return prisma.role.delete({
      where: { id },
    })
  }
}

// 导出单例实例
export const roleService = new RoleService()
