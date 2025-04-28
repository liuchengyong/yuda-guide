import { prisma } from '@/lib/prisma'
import { ResponseUtil } from '@/modules/http/response.util'
import { CreateMenuDto, Menu, MenuTreeVo } from './menu.model'
import { ResponseCode } from '../http/http.model'
import { NextRequest, NextResponse } from 'next/server'
import { validateSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'
import { MenuSchema } from './menu.constant'

/**
 * 权限服务类
 */
export class MenuService {
  /**
   * 获取全部菜单
   * @param request 请求对象
   * @returns 权限列表响应
   */

  static async getAll(): Promise<NextResponse> {
    try {
      const menus = await prisma.menu.findMany({
        orderBy: [{ sort: 'desc' }, { createdTime: 'desc' }],
      })
      return ResponseUtil.successList<Menu>(menus, menus.length, 1)
    } catch (error: any) {
      console.error('获取全部菜单:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  static async getAllTreeSelect(): Promise<NextResponse> {
    try {
      const menus: MenuTreeVo[] = await prisma.menu.findMany({
        orderBy: [{ sort: 'desc' }, { createdTime: 'desc' }],
        select: {
          id: true,
          name: true,
          parentId: true,
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
      return ResponseUtil.serverError(error.message)
    }
  }
}
