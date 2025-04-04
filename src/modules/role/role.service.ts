import { Permission } from './../../../node_modules/.pnpm/@prisma+client@6.5.0_prisma@6.5.0_typescript@5.8.2__typescript@5.8.2/node_modules/.prisma/client/index.d'
import { prisma } from '@/lib/prisma'
import { ResponseUtil } from '@/modules/http/response.util'
import { CreateRoleDto, GetRoleDto, Role, UpdateRoleDto } from './role.model'
import { ResponseCode } from '../http/http.model'
import { NextRequest, NextResponse } from 'next/server'
import { validateSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'
import { RoleSchema } from './role.constant'

/**
 * 角色服务类
 */
export class RoleService {
  /**
   * 获取角色列表
   * @returns 角色列表响应
   */
  static async getRoles(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = request.nextUrl
      const getRoleDto = {
        page: Number(searchParams.get('page')) || 1,
        pageSize: Number(searchParams.get('pageSize')) || 20,
        name: searchParams.get('name') || '',
        id: searchParams.get('id') || '',
        status: Number(searchParams.get('status')),
      } as GetRoleDto
      const where: Prisma.RoleWhereInput = {}
      if (getRoleDto.id) {
        where.id = {
          equals: getRoleDto.id,
        }
      }

      if (getRoleDto.name) {
        where.name = {
          contains: getRoleDto.name,
        }
      }

      if (getRoleDto.status) {
        where.status = {
          equals: getRoleDto.status,
        }
      }

      const total = await prisma.role.count({
        where,
      })

      const roles = await prisma.role.findMany({
        skip: (getRoleDto.page - 1) * getRoleDto.pageSize,
        take: getRoleDto.pageSize,
        orderBy: [{ updatedTime: 'desc' }],
        where,
        include: {
          rolePermissions: true,
        },
      })
      return ResponseUtil.successList(roles, total, getRoleDto.page)
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
      const validData = validateSchema<Partial<Role>>(RoleSchema, createRoleDto)
      if (validData.success) {
        const existingRole = await prisma.role.findFirst({
          where: {
            name: createRoleDto.name,
          },
        })
        if (existingRole) {
          return ResponseUtil.businessError(
            ResponseCode.ROLE_EXISTING,
            '角色已存在',
          )
        }

        const permissionIds = createRoleDto.permissionIds || []
        delete createRoleDto.permissionIds
        const newRole = await prisma.role.create({
          data: createRoleDto,
        })
        if (permissionIds.length > 0) {
          await prisma.rolePermission.createMany({
            data: permissionIds.map((permissionId) => ({
              permissionId,
              roleId: newRole.id,
            })),
          })
        }
        return ResponseUtil.success(newRole)
      } else {
        return ResponseUtil.businessValidError(validData.errors)
      }
    } catch (error: any) {
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
      const { searchParams } = request.nextUrl
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

      const updateRoleDto = (await request.json()) as UpdateRoleDto
      const validData = validateSchema(RoleSchema, updateRoleDto)

      if (!validData.success) {
        return ResponseUtil.businessValidError(validData.errors)
      }

      // 检查名称或代码是否与其他角色冲突
      const conflictRole = await prisma.role.findFirst({
        where: {
          name: updateRoleDto.name,
          NOT: { id },
        },
      })

      if (conflictRole) {
        return ResponseUtil.businessError(
          ResponseCode.ROLE_EXISTING,
          '角色名称或角色编码已存在',
        )
      }

      const permissionIds = updateRoleDto.permissionIds || []
      const rolePermissions = await prisma.rolePermission.findMany({
        where: {
          roleId: id,
        },
      })
      const deletePermissionIds = rolePermissions
        .filter(
          (rolePermission) =>
            !permissionIds.includes(rolePermission.permissionId),
        )
        .map((rolePermission) => rolePermission.permissionId)

      if (deletePermissionIds.length > 0) {
        await prisma.rolePermission.deleteMany({
          where: {
            roleId: id,
            permissionId: {
              in: deletePermissionIds,
            },
          },
        })
      }

      const createPermissionIds = permissionIds.filter(
        (permissionId) =>
          !rolePermissions.some(
            (rolePermission) => rolePermission.permissionId === permissionId,
          ),
      )
      if (createPermissionIds.length > 0) {
        await prisma.rolePermission.createMany({
          data: createPermissionIds.map((permissionId) => ({
            permissionId,
            roleId: id,
          })),
        })
      }

      delete updateRoleDto.permissionIds
      // 更新角色
      const updatedRole = await prisma.role.update({
        where: { id },
        data: updateRoleDto,
      })

      return ResponseUtil.success(updatedRole)
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

      // 删除角色（关联的角色-权限和用户-角色记录会通过级联删除自动删除）
      await prisma.role.delete({
        where: { id },
      })

      return ResponseUtil.success(null, '删除角色成功')
    } catch (error: any) {
      console.error('删除角色失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  /**
   * 分配角色权限
   * @param request 请求对象
   * @returns 分配结果响应
   */
  static async assignPermissions(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = new URL(request.url)
      const roleId = searchParams.get('roleId')

      if (!roleId) {
        return ResponseUtil.badRequest('角色ID不能为空')
      }

      // 检查角色是否存在
      const existingRole = await prisma.role.findUnique({
        where: { id: roleId },
      })

      if (!existingRole) {
        return ResponseUtil.businessError(ResponseCode.ERROR, '角色不存在')
      }

      const body = await request.json()
      const permissionIds = body.permissionIds as string[]

      if (!permissionIds || !Array.isArray(permissionIds)) {
        return ResponseUtil.badRequest('权限ID列表不能为空')
      }

      // 先删除该角色的所有权限
      await prisma.rolePermission.deleteMany({
        where: { roleId },
      })

      // 添加新的权限
      const rolePermissions = permissionIds.map((permissionId) => ({
        roleId,
        permissionId,
      }))

      await prisma.rolePermission.createMany({
        data: rolePermissions,
      })

      return ResponseUtil.success(null, '分配权限成功')
    } catch (error: any) {
      console.error('分配角色权限失败:', error)
      return ResponseUtil.serverError(error.message)
    }
  }
}
