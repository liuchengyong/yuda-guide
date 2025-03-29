import { prisma } from '@/lib/prisma'
import { ResponseUtil } from '@/modules/http/response.util'
import {
  CreatePermissionDto,
  CreatePermissionDtoSchema,
  Permission,
} from './permission.model'
import { ResponseCode } from '../http/http.model'
import { NextRequest, NextResponse } from 'next/server'
import { validateSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

/**
 * 权限服务类
 */
export class PermissionService {
  /**
   * 获取权限列表
   * @param request 请求对象
   * @returns 权限列表响应
   */
  static async getPermissions(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = request.nextUrl
      const searchPermissionDto = {
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '10'),
        name: searchParams.get('name') || undefined,
        code: searchParams.get('code') || undefined,
        type: searchParams.has('type')
          ? parseInt(searchParams.get('type') as string)
          : undefined,
      }

      // 构建查询条件
      const where: Prisma.PermissionWhereInput = {}
      if (searchPermissionDto.name)
        where.name = { contains: searchPermissionDto.name }
      if (searchPermissionDto.code)
        where.code = { contains: searchPermissionDto.code }
      if (searchPermissionDto.type !== undefined)
        where.type = searchPermissionDto.type

      // 查询总数
      const total = await prisma.permission.count({ where })

      // 查询分页数据
      const permissions = await prisma.permission.findMany({
        where,
        skip: (searchPermissionDto.page - 1) * searchPermissionDto.pageSize,
        take: searchPermissionDto.pageSize,
        orderBy: { createdTime: 'desc' },
      })

      return ResponseUtil.successList(
        permissions,
        total,
        searchPermissionDto.page,
        searchPermissionDto.pageSize,
      )
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
      const validData = validateSchema(
        CreatePermissionDtoSchema,
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

      const updateData = (await request.json()) as CreatePermissionDto
      const validData = validateSchema(CreatePermissionDtoSchema, updateData)

      if (!validData.success) {
        return ResponseUtil.businessValidError(validData.errors)
      }

      // 检查权限是否存在
      const existingPermission = await prisma.permission.findUnique({
        where: { id },
      })

      if (!existingPermission) {
        return ResponseUtil.businessError(ResponseCode.ERROR, '权限不存在')
      }

      // 检查名称或代码是否与其他权限冲突
      const conflictPermission = await prisma.permission.findFirst({
        where: {
          OR: [{ name: updateData.name }, { code: updateData.code }],
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
        data: updateData,
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
