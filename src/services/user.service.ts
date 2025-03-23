import { prisma } from '@/lib/prisma'
import { User } from '@/types/user'
import { BaseService } from './base.service'

/**
 * 用户服务类
 */
export class UserService extends BaseService<User> {
  constructor() {
    // 定义用户查询时的默认字段选择
    const selectFields = {
      id: true,
      account: true,
      email: true,
      avatar: true,
      createdTime: true,
      updatedTime: true,
      // 不返回密码字段
      roles: {
        select: {
          role: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
        },
      },
    }

    super('user', selectFields)
  }

  /**
   * 格式化用户数据，将roles数组转换为更简洁的格式
   */
  formatUser(user: any) {
    if (!user) return null

    return {
      ...user,
      roles: user.roles?.map((ur: any) => ur.role) || [],
    }
  }

  /**
   * 格式化用户列表数据
   */
  formatUsers(users: any[]) {
    return users.map(this.formatUser)
  }

  /**
   * 重写findAll方法，添加格式化逻辑
   */
  async findAll(options: any = {}) {
    const users = await super.findAll(options)
    return this.formatUsers(users)
  }

  /**
   * 重写findById方法，添加格式化逻辑
   */
  async findById(id: string, options: any = {}) {
    const user = await super.findById(id, options)
    return this.formatUser(user)
  }

  /**
   * 创建用户
   */
  async createUser(data: Partial<User> & { roles?: string[] }) {
    const { roles, ...userData } = data

    // 检查用户是否已存在
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [{ account: userData.account }, { email: userData.email }],
      },
    })

    if (existingUser) {
      throw new Error('User with this account or email already exists')
    }

    // 创建用户
    const user = await prisma.user.create({
      data: userData,
    })

    // 如果提供了角色，则创建用户-角色关联
    if (roles && Array.isArray(roles) && roles.length > 0) {
      await Promise.all(
        roles.map((roleId) =>
          prisma.userRole.create({
            data: {
              userId: user.id,
              roleId,
            },
          }),
        ),
      )
    }

    return user
  }

  /**
   * 更新用户
   */
  async updateUser(id: string, data: Partial<User> & { roles?: string[] }) {
    const { roles, ...userData } = data

    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      throw new Error('User not found')
    }

    // 如果更新账号或邮箱，检查是否与其他用户冲突
    if (userData.account || userData.email) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          OR: [
            userData.account ? { account: userData.account } : {},
            userData.email ? { email: userData.email } : {},
          ],
          NOT: { id },
        },
      })

      if (conflictUser) {
        throw new Error('Account or email already in use by another user')
      }
    }

    // 更新用户基本信息
    const updatedUser = await prisma.user.update({
      where: { id },
      data: userData,
    })

    // 如果提供了角色，则更新用户-角色关联
    if (roles) {
      // 先删除现有的角色关联
      await prisma.userRole.deleteMany({
        where: { userId: id },
      })

      // 创建新的角色关联
      if (Array.isArray(roles) && roles.length > 0) {
        await Promise.all(
          roles.map((roleId) =>
            prisma.userRole.create({
              data: {
                userId: id,
                roleId,
              },
            }),
          ),
        )
      }
    }

    return updatedUser
  }

  /**
   * 删除用户
   */
  async deleteUser(id: string) {
    // 检查用户是否存在
    const existingUser = await prisma.user.findUnique({
      where: { id },
    })

    if (!existingUser) {
      throw new Error('User not found')
    }

    // 删除用户（关联的用户-角色记录会通过级联删除自动删除）
    return prisma.user.delete({
      where: { id },
    })
  }
}

// 导出单例实例
export const userService = new UserService()
