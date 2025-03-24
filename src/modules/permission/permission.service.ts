import { prisma } from '@/lib/prisma'
import { ResponseUtil } from '@/modules/http/response.util'
import {
  CreatePermissionDto,
  CreatePermissionDtoSchema,
} from './permission.model'
import { ResponseCode } from '../http/http.model'
import { NextRequest, NextResponse } from 'next/server'
import { validateSchema } from '@/lib/validations'
import { error } from 'console'
import { message } from 'antd'

/**
 * 权限服务类
 */
export class PermissionService {
  /**
   * 创建权限
   *
   */
  static async createPermission(request: NextRequest): Promise<NextResponse> {
    try {
      const createPermissionDto = (await request.json()) as CreatePermissionDto
      const validData = validateSchema(
        CreatePermissionDtoSchema,
        createPermissionDto,
      )
      if (validData.success) {
        const existingPermission = await prisma.permission.findFirst({
          where: {
            OR: [
              {
                name: createPermissionDto.name,
                code: createPermissionDto.code,
              },
            ],
          },
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
   */
  static async updatePermission(request: NextRequest) {}

  /**
   * 删除权限
   */
  static async deletePermission(request: NextRequest) {
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
