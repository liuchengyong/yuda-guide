import { prisma } from '@/lib/prisma'
import { ResponseUtil } from '@/modules/http/response.util'
import {
  CreateMenuDto,
  MenuTreeVo,
  SearchMenuDto,
  UpdateMenuDto,
} from './menu.model'
import { ResponseCode } from '../http/http.model'
import { NextRequest, NextResponse } from 'next/server'
import { validateSchema } from '@/lib/validations'
import { Menu, Prisma } from '@prisma/client'
import { MenuSchema } from './menu.constant'

/**
 * 权限服务类
 */
export class MenuService {
  static async getList(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = request.nextUrl
      //'name' | 'path' | 'type' | 'code' | 'status'
      const searchDto = {
        name: searchParams.get('name') || '',
        path: searchParams.get('path') || '',
        type: Number(searchParams.get('type')),
        code: searchParams.get('code') || '',
        status: Number(searchParams.get('status')),
      } as SearchMenuDto
      const where: Prisma.MenuWhereInput = {}
      if (searchDto.name) {
        where.name = {
          contains: searchDto.name,
        }
      }
      if (searchDto.path) {
        where.path = {
          contains: searchDto.path,
        }
      }
      if (searchDto.type) {
        where.type = {
          equals: searchDto.type,
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

      const menus = await prisma.menu.findMany({
        orderBy: [{ sort: 'desc' }, { createdTime: 'desc' }],
        where,
      })
      return ResponseUtil.successList<Menu>(menus, menus.length, 1)
    } catch (error: any) {
      console.error('获取全部菜单:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  static async getSimpleList(): Promise<NextResponse> {
    try {
      const menus: MenuTreeVo[] = await prisma.menu.findMany({
        orderBy: [{ sort: 'desc' }, { createdTime: 'desc' }],
        select: {
          id: true,
          name: true,
          parentId: true,
          sort: true,
        },
      })
      return ResponseUtil.successList<MenuTreeVo>(menus, menus.length, 1)
    } catch (error: any) {
      console.error('获取全部菜单:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  static async create(request: NextRequest): Promise<NextResponse> {
    try {
      const createDto = (await request.json()) as CreateMenuDto
      const validData = validateSchema<Partial<Menu>>(MenuSchema, createDto)
      if (validData.success) {
        const where: Prisma.MenuWhereInput = {}
        where.OR = [
          {
            name: createDto.name,
            code: createDto.code,
          },
        ]
        const existing = await prisma.menu.findFirst({
          where,
        })
        if (existing) {
          return ResponseUtil.businessError(
            ResponseCode.RESOURCE_EXISTS,
            '菜单已存在',
          )
        }
        const create = await prisma.menu.create({
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
          '菜单ID不能为空',
        )
      }
      const existing = await prisma.menu.findUnique({
        where: { id },
      })
      if (!existing) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '菜单不存在',
        )
      }
      const updateDto = (await request.json()) as UpdateMenuDto
      const validData = validateSchema<Partial<Menu>>(MenuSchema, updateDto)
      if (!validData.success) {
        return ResponseUtil.businessValidError(validData.errors)
      }

      const conflict = await prisma.menu.findFirst({
        where: {
          OR: [{ name: updateDto.name }, { code: updateDto.code }],
          NOT: { id },
        },
      })

      if (conflict) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '菜单名称或权限码已存在',
        )
      }
      const updated = await prisma.menu.update({
        where: { id },
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
          '菜单ID不能为空',
        )
      }
      const existing = await prisma.menu.findUnique({
        where: { id },
      })
      if (!existing) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '菜单不存在',
        )
      }
      await prisma.menu.delete({
        where: { id },
      })

      return ResponseUtil.success(null, '删除权限成功')
    } catch (error: any) {
      console.log(error)
      return ResponseUtil.serverError(error.message)
    }
  }
}
