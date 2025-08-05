import { prisma } from '@/lib/prisma'
import { validateSchema } from '@/lib/validations'
import { ResponseUtil } from '@/modules/http/response.util'
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { ResponseCode } from '../http/http.type'
import {
  CreateRoleMenuDto,
  Role,
  UpdateRoleMenusIdDto,
} from '../role/role.type'
import {
  CreateUserDto,
  CreateUserSchema,
  SearchUserDto,
  UpdateUserDto,
  UserBo,
  UserUpdateSchema,
  UserVo,
} from './user.type'

/**
 * 权限服务类
 */
export class UserService {
  static async getList(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = request.nextUrl
      const searchDto = {
        id: searchParams.get('id') || '',
        account: searchParams.get('account') || '',
        email: searchParams.get('email') || '',
        status: Number(searchParams.get('status')),
        current: Number(searchParams.get('current')) || 1,
        pageSize: Number(searchParams.get('pageSize')) || 20,
      } as SearchUserDto
      const where: Prisma.UserWhereInput = {
        deletedAt: null,
      }
      if (searchDto.id) {
        where.id = {
          equals: searchDto.id,
        }
      }
      if (searchDto.account) {
        where.account = {
          contains: searchDto.account,
        }
      }
      if (searchDto.email) {
        where.email = {
          contains: searchDto.email,
        }
      }
      if (searchDto.status) {
        where.status = {
          equals: searchDto.status,
        }
      }

      const total = await prisma.user.count({
        where,
      })
      const datas = await prisma.user.findMany({
        orderBy: [{ createdTime: 'desc' }],
        where,
        skip: (searchDto.current - 1) * searchDto.pageSize,
        take: searchDto.pageSize,
      })
      return ResponseUtil.successList<UserVo>(
        datas,
        total,
        searchDto.current,
        searchDto.pageSize,
      )
    } catch (error: any) {
      console.error('获取全部用户:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  static async create(request: NextRequest): Promise<NextResponse> {
    try {
      const createDto = (await request.json()) as CreateUserDto
      const validData = validateSchema<CreateUserDto>(
        CreateUserSchema,
        createDto,
      )
      if (validData.success) {
        const existing = await prisma.user.findFirst({
          where: {
            deletedAt: null,
            account: createDto.account,
          },
        })
        if (existing) {
          return ResponseUtil.businessError(
            ResponseCode.RESOURCE_EXISTS,
            '用户已存在',
          )
        }
        const create = await prisma.user.create({
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
          '用户ID不能为空',
        )
      }
      const existing = await prisma.user.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      })
      if (!existing) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '用户不存在',
        )
      }
      const updateDto = (await request.json()) as UpdateUserDto
      const validData = validateSchema<Partial<UserBo>>(
        UserUpdateSchema,
        updateDto,
      )
      if (!validData.success) {
        return ResponseUtil.businessValidError(validData.errors)
      }

      const conflict = await prisma.user.findFirst({
        where: {
          deletedAt: null,
          account: updateDto.account,
          NOT: { id },
        },
      })

      if (conflict) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '账号已存在',
        )
      }
      const updated = await prisma.user.update({
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
          '用户ID不能为空',
        )
      }
      const existing = await prisma.user.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      })
      if (!existing) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '用户不存在',
        )
      }
      await prisma.user.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      })

      return ResponseUtil.success(null, '删除用户成功')
    } catch (error: any) {
      console.log(error)
      return ResponseUtil.serverError(error.message)
    }
  }

  static async getDetail(id: string): Promise<NextResponse> {
    try {
      if (!id) {
        return ResponseUtil.businessError(
          ResponseCode.INVALID_PARAM,
          '用户ID不能为空',
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
          '用户不存在',
        )
      }

      const roleMenus = await prisma.roleMenu.findMany({
        where: {
          roleId: id,
          deletedAt: null,
        },
      })

      return ResponseUtil.success<Role>(
        {
          ...existing,
          menuIds: roleMenus.map((roleMenu) => roleMenu.menuId),
        },
        '删除用户成功',
      )
    } catch (error: any) {
      console.log(error)
      return ResponseUtil.serverError(error.message)
    }
  }

  static async updateRoleMenusId(
    request: NextRequest,
    id: string,
  ): Promise<NextResponse> {
    try {
      if (!id) {
        return ResponseUtil.businessError(
          ResponseCode.INVALID_PARAM,
          '用户ID不能为空',
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
          '用户不存在',
        )
      }
      const updateDto = (await request.json()) as UpdateRoleMenusIdDto
      const menus = await prisma.menu.findMany({
        where: {
          id: {
            in: updateDto.menuIds,
          },
          deletedAt: null,
        },
      })
      const roleMenus = await prisma.roleMenu.findMany({
        where: {
          roleId: id,
          deletedAt: null,
        },
      })
      const deleteRoleMenus = roleMenus.filter(
        (roleMenu) => !menus.some((menu) => menu.id == roleMenu.menuId),
      )
      if (deleteRoleMenus.length > 0) {
        let deleteIds: string[] = deleteRoleMenus.map(
          (deleteRoleMenu) => deleteRoleMenu.id,
        )
        await prisma.roleMenu.updateMany({
          where: {
            id: {
              in: deleteIds,
            },
            deletedAt: null,
          },
          data: {
            deletedAt: new Date(),
          },
        })
      }
      const createMenus = menus.filter(
        (menu) => !roleMenus.some((roleMenu) => roleMenu.menuId == menu.id),
      )
      if (createMenus.length > 0) {
        let createRoleMenusData: CreateRoleMenuDto[] = createMenus.map(
          (menu) => {
            return {
              menuId: menu.id,
              roleId: id,
            }
          },
        )
        await prisma.roleMenu.createMany({
          data: createRoleMenusData,
        })
      }

      return ResponseUtil.success(true, '修改权限成功')
    } catch (error: any) {
      console.log(error)
      return ResponseUtil.serverError(error.message)
    }
  }
}
