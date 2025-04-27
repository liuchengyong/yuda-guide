import { prisma } from '@/lib/prisma'
import { ResponseUtil } from '@/modules/http/response.util'
import { CreateUserDto, GetUserDto, UpdateUserDto, User } from './user.model'
import { ResponseCode } from '../http/http.model'
import { NextRequest, NextResponse } from 'next/server'
import { validateSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'
import { UserSchema, UserUpdateSchema } from './user.constant'
import { GetRoleDto } from '../role/role.model'

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
      const getUserDto = {
        page: Number(searchParams.get('page')) || 1,
        pageSize: Number(searchParams.get('pageSize')) || 20,
        account: searchParams.get('account') || '',
        status: Number(searchParams.get('status')),
        email: searchParams.get('email') || '',
      } as GetUserDto

      const where: Prisma.UserWhereInput = {}
      if (getUserDto.account) {
        where.account = getUserDto.account
      }

      if (getUserDto.status) {
        where.status = getUserDto.status
      }

      if (getUserDto.email) {
        where.email = getUserDto.email
      }

      const users = await prisma.user.findMany({
        select: {
          id: true,
          account: true,
          email: true,
          avatar: true,
          status: true,
          createdTime: true,
          updatedTime: true,
        },
        where,
        skip: (getUserDto.page - 1) * getUserDto.pageSize,
        take: getUserDto.pageSize,
        orderBy: {
          updatedTime: 'desc',
        },
      })
      return ResponseUtil.successList(users, users.length, 1)
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
      const validData = validateSchema<Partial<User>>(UserSchema, createUserDto)
      if (validData.success) {
        const where: Prisma.UserWhereInput = {}
        where.account = createUserDto.account
        const existingUser = await prisma.user.findFirst({
          where,
        })
        if (existingUser) {
          return ResponseUtil.businessError(
            ResponseCode.USER_EXISTING,
            '用户已存在',
          )
        }
        const newUser = await prisma.user.create({
          data: createUserDto,
        })
        return ResponseUtil.success(newUser)
      } else {
        return ResponseUtil.businessValidError(validData.errors)
      }
    } catch (error: any) {
      return ResponseUtil.serverError(error.message)
    }
  }

  /**
   * 更新用户
   * @param request 请求对象
   * @returns 更新结果响应
   */
  static async updateUser(
    id: string,
    request: NextRequest,
  ): Promise<NextResponse> {
    try {
      const existingUser = await prisma.user.findUnique({
        where: { id },
      })
      if (!existingUser) {
        return ResponseUtil.businessError(ResponseCode.ERROR, '用户不存在')
      }

      const updateUserDto = (await request.json()) as UpdateUserDto
      const validData = validateSchema(UserUpdateSchema, updateUserDto)

      if (!validData.success) {
        return ResponseUtil.businessValidError(validData.errors)
      }

      // 检查账号是否与其他用户冲突
      const conflictUser = await prisma.user.findFirst({
        where: {
          OR: [
            { account: updateUserDto.account },
            { email: updateUserDto.email },
          ],
          NOT: { id },
        },
      })

      if (conflictUser) {
        return ResponseUtil.businessError(
          ResponseCode.USER_EXISTING,
          '账号或邮箱已被使用',
        )
      }

      // 更新用户
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateUserDto,
      })

      return ResponseUtil.success(updatedUser)
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
