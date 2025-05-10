import { prisma } from '@/lib/prisma'
import { validateSchema } from '@/lib/validations'
import { ResponseUtil } from '@/modules/http/response.util'
import { Prisma, Role } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { ResponseCode } from '../http/http.type'
import {
  CreateRoleDto,
  RoleSchema,
  SearchRoleDto,
  UpdateRoleDto,
} from './role.type'

/**
 * 权限服务类
 */
export class RoleService {
  static async getList(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = request.nextUrl
      const searchDto = {
        name: searchParams.get('name') || '',
        code: searchParams.get('code') || '',
        status: Number(searchParams.get('status')),
        current: Number(searchParams.get('current')) || 1,
        pageSize: Number(searchParams.get('pageSize')) || 20,
      } as SearchRoleDto
      const where: Prisma.RoleWhereInput = {
        deletedAt: null,
      }
      if (searchDto.name) {
        where.name = {
          contains: searchDto.name,
        }
      }
      if (searchDto.code) {
        where.code = {
          contains: searchDto.code,
        }
      }
      if (searchDto.status) {
        where.status = {
          equals: searchDto.status,
        }
      }

      const total = await prisma.role.count({
        where,
      })
      const datas = await prisma.role.findMany({
        orderBy: [{ sort: 'desc' }, { createdTime: 'desc' }],
        where,
        skip: (searchDto.current - 1) * searchDto.pageSize,
        take: searchDto.pageSize,
      })
      return ResponseUtil.successList<Role>(
        datas,
        total,
        searchDto.current,
        searchDto.pageSize,
      )
    } catch (error: any) {
      console.error('获取全部角色:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  static async create(request: NextRequest): Promise<NextResponse> {
    try {
      const createDto = (await request.json()) as CreateRoleDto
      const validData = validateSchema<Partial<Role>>(RoleSchema, createDto)
      if (validData.success) {
        const existing = await prisma.role.findFirst({
          where: {
            deletedAt: null,
            OR: [{ name: createDto.name }, { code: createDto.code }],
          },
        })
        if (existing) {
          return ResponseUtil.businessError(
            ResponseCode.RESOURCE_EXISTS,
            '角色已存在',
          )
        }
        const create = await prisma.role.create({
          data: createDto,
        })
        return ResponseUtil.success(create)
      } else {
        return ResponseUtil.businessValidError(validData.errors)
      }
    } catch (error: any) {
      console.log(error)
      return ResponseUtil.serverError(error.message)
    }
  }

  static async update(request: NextRequest, id: string): Promise<NextResponse> {
    try {
      if (!id) {
        return ResponseUtil.businessError(
          ResponseCode.INVALID_PARAM,
          '角色ID不能为空',
        )
      }
      const existing = await prisma.role.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      })
      if (!existing) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '角色不存在',
        )
      }
      const updateDto = (await request.json()) as UpdateRoleDto
      const validData = validateSchema<Partial<Role>>(RoleSchema, updateDto)
      if (!validData.success) {
        return ResponseUtil.businessValidError(validData.errors)
      }

      const conflict = await prisma.role.findFirst({
        where: {
          deletedAt: null,
          OR: [{ name: updateDto.name }, { code: updateDto.code }],
          NOT: { id },
        },
      })

      if (conflict) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '角色名称或角色编码已存在',
        )
      }
      const updated = await prisma.role.update({
        where: {
          id,
          deletedAt: null,
        },
        data: updateDto,
      })
      return ResponseUtil.success(updated)
    } catch (error: any) {
      console.log(error)
      return ResponseUtil.serverError(error.message)
    }
  }

  static async delete(id: string): Promise<NextResponse> {
    try {
      if (!id) {
        return ResponseUtil.businessError(
          ResponseCode.INVALID_PARAM,
          '角色ID不能为空',
        )
      }
      const existing = await prisma.role.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      })
      if (!existing) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '角色不存在',
        )
      }
      await prisma.role.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      })

      return ResponseUtil.success(null, '删除角色成功')
    } catch (error: any) {
      console.log(error)
      return ResponseUtil.serverError(error.message)
    }
  }
}
