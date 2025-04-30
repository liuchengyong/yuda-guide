import { prisma } from '@/lib/prisma'
import { ResponseUtil } from '@/modules/http/response.util'
import { ResponseCode } from '../http/http.model'
import { NextRequest, NextResponse } from 'next/server'
import { validateSchema } from '@/lib/validations'
import { Prisma } from '@prisma/client'
import {
  CreateDeptDto,
  Dept,
  DeptTreeVo,
  SearchDeptDto,
  UpdateDeptDto,
} from './dept.model'
import { DeptSchema } from './dept.constant'
export class DeptService {
  static async getList(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = request.nextUrl
      const searchDto = {
        name: searchParams.get('name') || '',
        status: Number(searchParams.get('status')),
      } as SearchDeptDto
      const where: Prisma.DeptWhereInput = {}
      if (searchDto.name) {
        where.name = {
          contains: searchDto.name,
        }
      }
      if (searchDto.status) {
        where.status = {
          equals: searchDto.status,
        }
      }

      const datas = await prisma.dept.findMany({
        orderBy: [{ sort: 'desc' }, { createdTime: 'desc' }],
        where,
      })
      return ResponseUtil.successList<Dept>(datas, datas.length, 1)
    } catch (error: any) {
      console.error('获取全部部门:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  static async getSimpleList(): Promise<NextResponse> {
    try {
      const datas: DeptTreeVo[] = await prisma.dept.findMany({
        orderBy: [{ sort: 'desc' }, { createdTime: 'desc' }],
        select: {
          id: true,
          name: true,
          parentId: true,
          sort: true,
        },
      })
      return ResponseUtil.successList<DeptTreeVo>(datas, datas.length, 1)
    } catch (error: any) {
      console.error('获取全部部门:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  static async create(request: NextRequest): Promise<NextResponse> {
    try {
      const createDto = (await request.json()) as CreateDeptDto
      const validData = validateSchema<Partial<Dept>>(DeptSchema, createDto)
      if (validData.success) {
        const existing = await prisma.dept.findFirst({
          where: {
            name: createDto.name,
          },
        })
        if (existing) {
          return ResponseUtil.businessError(
            ResponseCode.RESOURCE_EXISTS,
            '部门已存在',
          )
        }
        const create = await prisma.dept.create({
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
          '部门ID不能为空',
        )
      }
      const existing = await prisma.dept.findUnique({
        where: { id },
      })
      if (!existing) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '部门不存在',
        )
      }
      const updateDto = (await request.json()) as UpdateDeptDto
      const validData = validateSchema<Partial<Dept>>(DeptSchema, updateDto)
      if (!validData.success) {
        return ResponseUtil.businessValidError(validData.errors)
      }

      const conflict = await prisma.dept.findFirst({
        where: {
          name: updateDto.name,
          NOT: { id },
        },
      })

      if (conflict) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '部门名称或权限码已存在',
        )
      }
      const updated = await prisma.dept.update({
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
          '部门ID不能为空',
        )
      }
      const existing = await prisma.dept.findUnique({
        where: { id },
      })
      if (!existing) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '部门不存在',
        )
      }
      await prisma.dept.delete({
        where: { id },
      })

      return ResponseUtil.success(null, '删除部门成功')
    } catch (error: any) {
      console.log(error)
      return ResponseUtil.serverError(error.message)
    }
  }
}
