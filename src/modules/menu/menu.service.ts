import { prisma } from '@/lib/prisma'
import { ResponseUtil } from '@/modules/http/response.util'

import { validateSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { ResponseCode } from '../http/http.type'
import {
  CreateMenuDto,
  Menu,
  MenuSchema,
  MenuTreeVo,
  SearchMenuDto,
  UpdateMenuDto,
} from './menu.type'
export class MenuService {
  static async getList(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = request.nextUrl
      const searchDto = {
        name: searchParams.get('name') || '',
        path: searchParams.get('path') || '',
        type: Number(searchParams.get('type')),
        code: searchParams.get('code') || '',
        status: Number(searchParams.get('status')),
      } as SearchMenuDto
      const where: Prisma.MenuWhereInput = {
        deletedAt: null,
      }
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

      const datas = await prisma.menu.findMany({
        orderBy: [{ sort: 'asc' }, { createdTime: 'desc' }],
        where,
      })
      return ResponseUtil.successList<Menu>(datas, datas.length, 1)
    } catch (error: any) {
      console.error('获取全部菜单:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  static async getSimpleList(): Promise<NextResponse> {
    try {
      const datas: MenuTreeVo[] = await prisma.menu.findMany({
        where: {
          deletedAt: null,
        },
        orderBy: [{ sort: 'asc' }, { createdTime: 'desc' }],
        select: {
          id: true,
          name: true,
          parentId: true,
          sort: true,
        },
      })
      return ResponseUtil.successList<MenuTreeVo>(datas, datas.length, 1)
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
        const existing = await prisma.menu.findFirst({
          where: {
            deletedAt: null,
            OR: [{ name: createDto.name }, { code: createDto.code }],
          },
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
        where: { id, deletedAt: null },
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
          deletedAt: null,
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
        where: { id, deletedAt: null },
        data: updateDto,
      })
      return ResponseUtil.success(updated)
    } catch (error: any) {
      console.log(error)
      return ResponseUtil.serverError(error.message)
    }
  }

  /**
   * 获取当前id的所有子孙元素
   * @param ids
   * @returns
   */
  static async getAllChildrenIds(ids: string[]): Promise<string[]> {
    const childrens = await prisma.menu.findMany({
      where: {
        parentId: {
          in: ids,
        },
        deletedAt: null,
      },
      select: {
        id: true,
      },
    })
    let childrenIds: string[] = []
    childrens.forEach((item) => {
      childrenIds.push(item.id)
    })
    if (childrenIds.length > 0) {
      childrenIds = await this.getAllChildrenIds(childrenIds)
    }

    return ids.concat(childrenIds)
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
        where: {
          id,
          deletedAt: null,
        },
      })
      if (!existing) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '菜单不存在',
        )
      }

      let deletedIds = await this.getAllChildrenIds([id])
      await prisma.menu.updateMany({
        where: {
          id: {
            in: deletedIds,
          },
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      })

      return ResponseUtil.success(null, '删除菜单成功')
    } catch (error: any) {
      console.log(error)
      return ResponseUtil.serverError(error.message)
    }
  }
}
