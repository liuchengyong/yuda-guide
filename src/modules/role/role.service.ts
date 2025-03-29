import { prisma } from '@/lib/prisma'
import { ResponseUtil } from '@/modules/http/response.util'
import {
  CreateRoleDto,
  CreateRoleDtoSchema,
  Role,
  SearchRoleDto,
  UpdateRoleDto,
} from './role.model'
import { ResponseCode } from '../http/http.model'
import { NextRequest, NextResponse } from 'next/server'
import { validateSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'

/**
 * 角色服务类
 */
export class RoleService {
  /**
   * 获取角色列表
   * @param request 请求对象
   * @returns 角色列表响应
   */
  static async getRoles(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = request.nextUrl
      const searchRoleDto: SearchRoleDto = {
        page: parseInt(searchParams.get('page') || '1'),
        pageSize: parseInt(searchParams.get('pageSize') || '10'),
        name: searchParams.get('name') || undefined,
        status: searchParams.has('status')
          ? parseInt(searchParams.get('status') as string)
          : undefined,
      }

      // 构建查询条件
      const where: Prisma.RoleWhereInput = {}
      if (searchRoleDto.name) where.name = { contains: searchRoleDto.name }
      if (searchRoleDto.status !== undefined)
        where.status = searchRoleDto.status

      // 查询总数
      const total = await prisma.role.count({ where })

      // 查询分页数据
      const roles = await prisma.role.findMany({
        where,
        skip: (searchRoleDto.page - 1) * searchRoleDto.pageSize,
        take: searchRoleDto.pageSize,
        orderBy: { createdTime: 'desc' },
        include: {
          permissions: {
            select: {
              permission: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  type: true,
                  description: true,
                },
              },
            },
          },
        },
      })

      return ResponseUtil.successList(
        roles,
        total,
        searchRoleDto.page,
        searchRoleDto.pageSize,
      )
    } catch (error: any) {
      console.error('获取角色列表失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  /**
   * 创建角色
   * @param request 请求对象
   * @returns 创建结果响应
   */
  static async createRole(request: NextRequest): Promise<NextResponse> {
    try {
      const createRoleDto = (await request.json()) as CreateRoleDto
      const validData = validateSchema(CreateRoleDtoSchema, createRoleDto)

      if (validData.success) {
        // 检查角色名是否已存在
        const existingRole = await prisma.role.findUnique({
          where: { name: createRoleDto.name },
        })

        if (existingRole) {
          return ResponseUtil.businessError(
            ResponseCode.ROLE_EXISTING,
            '角色名称已存在',
          )
        }

        // 提取权限列表
        const { permissions, ...roleData } = createRoleDto

        // 创建角色
        const newRole = await prisma.role.create({
          data: roleData,
        })

        // 如果提供了权限，则创建角色-权限关联
        if (permissions && permissions.length > 0) {
          await Promise.all(
            permissions.map((permissionId) =>
              prisma.rolePermission.create({
                data: {
                  roleId: newRole.id,
                  permissionId,
                },
              }),
            ),
          )
        }

        // 查询包含权限信息的完整角色数据
        const roleWithPermissions = await prisma.role.findUnique({
          where: { id: newRole.id },
          include: {
            permissions: {
              select: {
                permission: {
                  select: {
                    id: true,
                    name: true,
                    code: true,
                    type: true,
                    description: true,
                  },
                },
              },
            },
          },
        })

        return ResponseUtil.success(roleWithPermissions)
      } else {
        return ResponseUtil.businessValidError(validData.errors)
      }
    } catch (error: any) {
      console.error('创建角色失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  /**
   * 更新角色
   * @param request 请求对象
   * @returns 更新结果响应
   */
  static async updateRole(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')

      if (!id) {
        return ResponseUtil.badRequest('角色ID不能为空')
      }

      const updateData = (await request.json()) as UpdateRoleDto

      // 验证数据
      if (updateData.name) {
        const validData = validateSchema(
          CreateRoleDtoSchema.pick({ name: true }),
          { name: updateData.name },
        )
        if (!validData.success) {
          return ResponseUtil.businessValidError(validData.errors)
        }
      }

      // 检查角色是否存在
      const existingRole = await prisma.role.findUnique({
        where: { id },
      })

      if (!existingRole) {
        return ResponseUtil.businessError(ResponseCode.ERROR, '角色不存在')
      }

      // 检查角色名是否与其他角色冲突
      if (updateData.name && updateData.name !== existingRole.name) {
        const conflictRole = await prisma.role.findUnique({
          where: { name: updateData.name },
        })

        if (conflictRole) {
          return ResponseUtil.businessError(
            ResponseCode.ROLE_EXISTING,
            '角色名称已被使用',
          )
        }
      }

      // 提取权限列表
      const { permissions, ...roleData } = updateData

      // 更新角色基本信息
      const updatedRole = await prisma.role.update({
        where: { id },
        data: roleData,
      })

      // 如果提供了权限，则更新角色-权限关联
      if (permissions !== undefined) {
        // 先删除现有的权限关联
        await prisma.rolePermission.deleteMany({
          where: { roleId: id },
        })

        // 创建新的权限关联
        if (permissions && permissions.length > 0) {
          await Promise.all(
            permissions.map((permissionId) =>
              prisma.rolePermission.create({
                data: {
                  roleId: id,
                  permissionId,
                },
              }),
            ),
          )
        }
      }

      // 查询包含权限信息的完整角色数据
      const roleWithPermissions = await prisma.role.findUnique({
        where: { id },
        include: {
          permissions: {
            select: {
              permission: {
                select: {
                  id: true,
                  name: true,
                  code: true,
                  type: true,
                  description: true,
                },
              },
            },
          },
        },
      })

      return ResponseUtil.success(roleWithPermissions)
    } catch (error: any) {
      console.error('更新角色失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  /**
   * 删除角色
   * @param request 请求对象
   * @returns 删除结果响应
   */
  static async deleteRole(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')

      if (!id) {
        return ResponseUtil.badRequest('角色ID不能为空')
      }

      // 检查角色是否存在
      const existingRole = await prisma.role.findUnique({
        where: { id },
      })

      if (!existingRole) {
        return ResponseUtil.businessError(ResponseCode.ERROR, '角色不存在')
      }

      // 删除角色（关联的角色-权限记录会通过级联删除自动删除）
      await prisma.role.delete({
        where: { id },
      })

      return ResponseUtil.success(null, '删除角色成功')
    } catch (error: any) {
      console.error('删除角色失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }
}
