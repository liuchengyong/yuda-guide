import { prisma } from '@/lib/prisma'
import { ResponseUtil } from '@/modules/http/response.util'
import {
  CreateUserDto,
  CreateUserDtoSchema,
  SearchUserDto,
  UpdateUserDto,
  User,
} from './user.model'
import { ResponseCode } from '../http/http.model'
import { NextRequest, NextResponse } from 'next/server'
import { validateSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'
import bcrypt from 'bcrypt'

/**
 * 用户服务类
 */
export class UserService {
  /**
   * 获取用户列表
   * @param request 请求对象
   * @returns 用户列表响应
   */
  static async getUsers(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = request.nextUrl
      const searchUserDto: SearchUserDto = {
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '10'),
        account: searchParams.get('account') || undefined,
        email: searchParams.get('email') || undefined,
        status: searchParams.has('status')
          ? parseInt(searchParams.get('status') as string)
          : undefined,
      }

      // 构建查询条件
      const where: Prisma.UserWhereInput = {}
      if (searchUserDto.account)
        where.account = { contains: searchUserDto.account }
      if (searchUserDto.email) where.email = { contains: searchUserDto.email }
      if (searchUserDto.status !== undefined)
        where.status = searchUserDto.status

      // 查询总数
      const total = await prisma.user.count({ where })

      // 查询分页数据
      const users = await prisma.user.findMany({
        where,
        skip: (searchUserDto.page - 1) * searchUserDto.pageSize,
        take: searchUserDto.pageSize,
        orderBy: { createdTime: 'desc' },
        select: {
          id: true,
          account: true,
          email: true,
          avatar: true,
          status: true,
          createdTime: true,
          updatedTime: true,
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
        },
      })

      return ResponseUtil.successList(
        users,
        total,
        searchUserDto.page,
        searchUserDto.pageSize,
      )
    } catch (error: any) {
      console.error('获取用户列表失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  /**
   * 创建用户
   * @param request 请求对象
   * @returns 创建结果响应
   */
  static async createUser(request: NextRequest): Promise<NextResponse> {
    try {
      const createUserDto = (await request.json()) as CreateUserDto
      const validData = validateSchema(CreateUserDtoSchema, createUserDto)

      if (validData.success) {
        // 检查用户名或邮箱是否已存在
        const existingUser = await prisma.user.findFirst({
          where: {
            OR: [
              { account: createUserDto.account },
              { email: createUserDto.email },
            ],
          },
        })

        if (existingUser) {
          return ResponseUtil.businessError(
            ResponseCode.USER_EXISTING,
            '用户账号或邮箱已存在',
          )
        }

        // 对密码进行加密
        const hashedPassword = await bcrypt.hash(createUserDto.password, 10)

        // 提取角色列表
        const { roles, ...userData } = createUserDto

        // 创建用户
        const newUser = await prisma.user.create({
          data: {
            ...userData,
            password: hashedPassword,
          },
        })

        // 如果提供了角色，则创建用户-角色关联
        if (roles && roles.length > 0) {
          await Promise.all(
            roles.map((roleId) =>
              prisma.userRole.create({
                data: {
                  userId: newUser.id,
                  roleId,
                },
              }),
            ),
          )
        }

        // 查询包含角色信息的完整用户数据（不包含密码）
        const userWithRoles = await prisma.user.findUnique({
          where: { id: newUser.id },
          select: {
            id: true,
            account: true,
            email: true,
            avatar: true,
            status: true,
            createdTime: true,
            updatedTime: true,
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
          },
        })

        return ResponseUtil.success(userWithRoles)
      } else {
        return ResponseUtil.businessValidError(validData.errors)
      }
    } catch (error: any) {
      console.error('创建用户失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  /**
   * 更新用户
   * @param request 请求对象
   * @returns 更新结果响应
   */
  static async updateUser(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')

      if (!id) {
        return ResponseUtil.badRequest('用户ID不能为空')
      }

      const updateData = (await request.json()) as UpdateUserDto

      // 检查用户是否存在
      const existingUser = await prisma.user.findUnique({
        where: { id },
      })

      if (!existingUser) {
        return ResponseUtil.businessError(ResponseCode.ERROR, '用户不存在')
      }

      // 检查账号和邮箱是否与其他用户冲突
      if (updateData.account || updateData.email) {
        const conflictUser = await prisma.user.findFirst({
          where: {
            OR: [
              updateData.account ? { account: updateData.account } : {},
              updateData.email ? { email: updateData.email } : {},
            ],
            NOT: { id },
          },
        })

        if (conflictUser) {
          return ResponseUtil.businessError(
            ResponseCode.USER_EXISTING,
            '账号或邮箱已被其他用户使用',
          )
        }
      }

      // 提取角色列表
      const { roles, ...userData } = updateData

      // 处理密码更新
      let updatedUserData: any = { ...userData }

      if ('password' in updateData && updateData.password) {
        updatedUserData.password = await bcrypt.hash(updateData.password, 10)
      }

      // 更新用户基本信息
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updatedUserData,
      })

      // 如果提供了角色，则更新用户-角色关联
      if (roles !== undefined) {
        // 先删除现有的角色关联
        await prisma.userRole.deleteMany({
          where: { userId: id },
        })

        // 创建新的角色关联
        if (roles && roles.length > 0) {
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

      // 查询包含角色信息的完整用户数据（不包含密码）
      const userWithRoles = await prisma.user.findUnique({
        where: { id },
        select: {
          id: true,
          account: true,
          email: true,
          avatar: true,
          status: true,
          createdTime: true,
          updatedTime: true,
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
        },
      })

      return ResponseUtil.success(userWithRoles)
    } catch (error: any) {
      console.error('更新用户失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  /**
   * 删除用户
   * @param request 请求对象
   * @returns 删除结果响应
   */
  static async deleteUser(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')

      if (!id) {
        return ResponseUtil.badRequest('用户ID不能为空')
      }

      // 检查用户是否存在
      const existingUser = await prisma.user.findUnique({
        where: { id },
      })

      if (!existingUser) {
        return ResponseUtil.businessError(ResponseCode.ERROR, '用户不存在')
      }

      // 删除用户（关联的用户-角色记录会通过级联删除自动删除）
      await prisma.user.delete({
        where: { id },
      })

      return ResponseUtil.success(null, '删除用户成功')
    } catch (error: any) {
      console.error('删除用户失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }
}
