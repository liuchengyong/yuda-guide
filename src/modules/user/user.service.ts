import { prisma } from '@/lib/prisma'
import { ResponseUtil } from '@/modules/http/response.util'
import {
  CreateUserDto,
  LoginUserDto,
  UpdatePasswordDto,
  UpdateUserDto,
  User,
} from './user.model'
import { ResponseCode } from '../http/http.model'
import { NextRequest, NextResponse } from 'next/server'
import { validateSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'
import { LoginSchema, UpdatePasswordSchema, UserSchema } from './user.constant'
import * as bcrypt from 'bcrypt'
import * as jwt from 'jsonwebtoken'

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
      const users = await prisma.user.findMany({
        select: {
          id: true,
          username: true,
          email: true,
          phone: true,
          nickname: true,
          avatar: true,
          status: true,
          lastLoginTime: true,
          createdTime: true,
          updatedTime: true,
          roles: {
            include: {
              role: true,
            },
          },
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
        where.OR = [
          {
            username: createUserDto.username,
          },
          {
            email: createUserDto.email,
          },
        ]
        const existingUser = await prisma.user.findFirst({
          where,
        })
        if (existingUser) {
          return ResponseUtil.businessError(
            ResponseCode.USER_EXISTING,
            '用户已存在',
          )
        }

        // 密码加密
        if (createUserDto.password) {
          const salt = await bcrypt.genSalt(10)
          createUserDto.password = await bcrypt.hash(
            createUserDto.password,
            salt,
          )
        }

        const newUser = await prisma.user.create({
          data: createUserDto,
        })

        // 返回时去除密码
        const { password, ...userWithoutPassword } = newUser
        return ResponseUtil.success(userWithoutPassword)
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
  static async updateUser(request: NextRequest): Promise<NextResponse> {
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

      const updateUserDto = (await request.json()) as UpdateUserDto
      const validData = validateSchema(UserSchema, updateUserDto)

      if (!validData.success) {
        return ResponseUtil.businessValidError(validData.errors)
      }

      // 检查邮箱是否与其他用户冲突
      if (updateUserDto.email) {
        const conflictUser = await prisma.user.findFirst({
          where: {
            email: updateUserDto.email,
            NOT: { id },
          },
        })

        if (conflictUser) {
          return ResponseUtil.businessError(
            ResponseCode.USER_EXISTING,
            '邮箱已被使用',
          )
        }
      }

      // 更新用户
      const updatedUser = await prisma.user.update({
        where: { id },
        data: updateUserDto,
      })

      // 返回时去除密码
      const { password, ...userWithoutPassword } = updatedUser
      return ResponseUtil.success(userWithoutPassword)
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

  /**
   * 用户登录
   * @param request 请求对象
   * @returns 登录结果响应
   */
  static async login(request: NextRequest): Promise<NextResponse> {
    try {
      const loginUserDto = (await request.json()) as LoginUserDto
      const validData = validateSchema<LoginUserDto>(LoginSchema, loginUserDto)

      if (!validData.success) {
        return ResponseUtil.businessValidError(validData.errors)
      }

      // 查找用户
      const user = await prisma.user.findFirst({
        where: {
          username: loginUserDto.username,
        },
        include: {
          roles: {
            include: {
              role: {
                include: {
                  permissions: {
                    include: {
                      permission: true,
                    },
                  },
                },
              },
            },
          },
        },
      })

      if (!user) {
        return ResponseUtil.businessError(
          ResponseCode.ERROR,
          '用户名或密码错误',
        )
      }

      // 验证密码
      const isPasswordValid = await bcrypt.compare(
        loginUserDto.password,
        user.password,
      )

      if (!isPasswordValid) {
        return ResponseUtil.businessError(
          ResponseCode.ERROR,
          '用户名或密码错误',
        )
      }

      // 检查用户状态
      if (user.status === 0) {
        return ResponseUtil.businessError(ResponseCode.ERROR, '用户已被禁用')
      }

      // 更新最后登录时间
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLoginTime: new Date() },
      })

      // 生成 JWT Token
      const token = jwt.sign(
        { id: user.id, username: user.username },
        process.env.JWT_SECRET || 'yuda-secret',
        { expiresIn: '1d' },
      )

      // 返回用户信息和token（不包含密码）
      const { password, ...userWithoutPassword } = user
      return ResponseUtil.success({
        user: userWithoutPassword,
        token,
      })
    } catch (error: any) {
      console.error('用户登录失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  /**
   * 修改密码
   * @param request 请求对象
   * @returns 修改结果响应
   */
  static async updatePassword(request: NextRequest): Promise<NextResponse> {
    try {
      const updatePasswordDto = (await request.json()) as UpdatePasswordDto
      const validData = validateSchema<UpdatePasswordDto>(
        UpdatePasswordSchema,
        updatePasswordDto,
      )

      if (!validData.success) {
        return ResponseUtil.businessValidError(validData.errors)
      }

      // 查找用户
      const user = await prisma.user.findUnique({
        where: { id: updatePasswordDto.id },
      })

      if (!user) {
        return ResponseUtil.businessError(ResponseCode.ERROR, '用户不存在')
      }

      // 验证旧密码
      const isPasswordValid = await bcrypt.compare(
        updatePasswordDto.oldPassword,
        user.password,
      )

      if (!isPasswordValid) {
        return ResponseUtil.businessError(ResponseCode.ERROR, '旧密码不正确')
      }

      // 加密新密码
      const salt = await bcrypt.genSalt(10)
      const hashedPassword = await bcrypt.hash(
        updatePasswordDto.newPassword,
        salt,
      )

      // 更新密码
      await prisma.user.update({
        where: { id: user.id },
        data: { password: hashedPassword },
      })

      return ResponseUtil.success(null, '密码修改成功')
    } catch (error: any) {
      console.error('修改密码失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  /**
   * 分配用户角色
   * @param request 请求对象
   * @returns 分配结果响应
   */
  static async assignRoles(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const userId = searchParams.get('userId')

      if (!userId) {
        return ResponseUtil.badRequest('用户ID不能为空')
      }

      // 检查用户是否存在
      const existingUser = await prisma.user.findUnique({
        where: { id: userId },
      })

      if (!existingUser) {
        return ResponseUtil.businessError(ResponseCode.ERROR, '用户不存在')
      }

      const body = await request.json()
      const roleIds = body.roleIds as string[]

      if (!roleIds || !Array.isArray(roleIds)) {
        return ResponseUtil.badRequest('角色ID列表不能为空')
      }

      // 先删除该用户的所有角色
      await prisma.userRole.deleteMany({
        where: { userId },
      })

      // 添加新的角色
      const userRoles = roleIds.map((roleId) => ({
        userId,
        roleId,
      }))

      await prisma.userRole.createMany({
        data: userRoles,
      })

      return ResponseUtil.success(null, '分配角色成功')
    } catch (error: any) {
      console.error('分配用户角色失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }
}
