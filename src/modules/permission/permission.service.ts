import { prisma } from '@/lib/prisma'
import { ResponseUtil } from '@/modules/http/response.util'
import {
  CreatePermissionDto,
  Permission,
  UpdatePermissionDto,
} from './permission.model'
import { ResponseCode } from '../http/http.model'
import { NextRequest, NextResponse } from 'next/server'
import { validateSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'
import { PermissionSchema } from './permission.constant'

/**
 * 权限服务类
 */
export class PermissionService {
  /**
   * 获取权限列表
   * @param request 请求对象
   * @returns 权限列表响应
   */
  static async getPermissions(): Promise<NextResponse> {
    try {
      const permissions = await prisma.permission.findMany({
        orderBy: [{ sort: 'desc' }],
      })
      return ResponseUtil.successList(permissions, permissions.length, 1)
    } catch (error: any) {
      console.error('获取权限列表失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  /**
   * 创建权限
   * @param request 请求对象
   * @returns 创建结果响应
   */
  static async createPermission(request: NextRequest): Promise<NextResponse> {
    try {
      const createPermissionDto = (await request.json()) as CreatePermissionDto
      const validData = validateSchema<Partial<Permission>>(
        PermissionSchema,
        createPermissionDto,
      )
      if (validData.success) {
        const where: Prisma.PermissionWhereInput = {}
        where.OR = [
          {
            name: createPermissionDto.name,
            code: createPermissionDto.code,
          },
        ]
        const existingPermission = await prisma.permission.findFirst({
          where,
        })
        if (existingPermission) {
          return ResponseUtil.businessError(
            ResponseCode.PERMISSION_EXISTING,
            '权限已存在',
          )
        }
        const newPermission = await prisma.permission.create({
          data: createPermissionDto,
        })
        return ResponseUtil.success(newPermission)
      } else {
        return ResponseUtil.businessValidError(validData.errors)
      }
    } catch (error: any) {
      return ResponseUtil.serverError(error.message)
    }
  }

  /**
   * 更新权限
   * @param request 请求对象
   * @returns 更新结果响应
   */
  static async updatePermission(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')

      if (!id) {
        return ResponseUtil.badRequest('权限ID不能为空')
      }

      // 检查权限是否存在
      const existingPermission = await prisma.permission.findUnique({
        where: { id },
      })

      if (!existingPermission) {
        return ResponseUtil.businessError(ResponseCode.ERROR, '权限不存在')
      }

      const updatePermissionDto = (await request.json()) as UpdatePermissionDto
      const validData = validateSchema(PermissionSchema, updatePermissionDto)

      if (!validData.success) {
        return ResponseUtil.businessValidError(validData.errors)
      }

      // 检查名称或代码是否与其他权限冲突
      const conflictPermission = await prisma.permission.findFirst({
        where: {
          OR: [
            { name: updatePermissionDto.name },
            { code: updatePermissionDto.code },
          ],
          NOT: { id },
        },
      })

      if (conflictPermission) {
        return ResponseUtil.businessError(
          ResponseCode.PERMISSION_EXISTING,
          '权限名称或权限码已存在',
        )
      }

      // 更新权限
      const updatedPermission = await prisma.permission.update({
        where: { id },
        data: updatePermissionDto,
      })

      return ResponseUtil.success(updatedPermission)
    } catch (error: any) {
      console.error('更新权限失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  /**
   * 删除权限
   * @param request 请求对象
   * @returns 删除结果响应
   */
  static async deletePermission(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')

      if (!id) {
        return ResponseUtil.badRequest('权限ID不能为空')
      }

      // 检查权限是否存在
      const existingPermission = await prisma.permission.findUnique({
        where: { id },
      })

      if (!existingPermission) {
        return ResponseUtil.businessError(ResponseCode.ERROR, '权限不存在')
      }

      // 删除权限（关联的角色-权限记录会通过级联删除自动删除）
      await prisma.permission.delete({
        where: { id },
      })

      return ResponseUtil.success(null, '删除权限成功')
    } catch (error: any) {
      console.error('删除权限失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }
}
