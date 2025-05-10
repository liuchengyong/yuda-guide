import { prisma } from '@/lib/prisma'
import { validateSchema } from '@/lib/validations'
import { ResponseUtil } from '@/modules/http/response.util'
import { Prisma } from '@prisma/client'
import { NextRequest, NextResponse } from 'next/server'
import { ResponseCode } from '../http/http.type'
import {
  CreatePostDto,
  Post,
  PostSchema,
  SearchPostDto,
  UpdatePostDto,
} from './post.type'

/**
 * 权限服务类
 */
export class PostService {
  static async getList(request: NextRequest): Promise<NextResponse> {
    try {
      const { searchParams } = request.nextUrl
      const searchDto = {
        name: searchParams.get('name') || '',
        code: searchParams.get('code') || '',
        status: Number(searchParams.get('status')),
        current: Number(searchParams.get('current')) || 1,
        pageSize: Number(searchParams.get('pageSize')) || 20,
      } as SearchPostDto
      const where: Prisma.PostWhereInput = {
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

      const total = await prisma.post.count({
        where,
      })
      const datas = await prisma.post.findMany({
        orderBy: [{ sort: 'desc' }, { createdTime: 'desc' }],
        where,
        skip: (searchDto.current - 1) * searchDto.pageSize,
        take: searchDto.pageSize,
      })
      return ResponseUtil.successList<Post>(
        datas,
        total,
        searchDto.current,
        searchDto.pageSize,
      )
    } catch (error: any) {
      console.error('获取全部岗位:', error)
      return ResponseUtil.serverError(error.message)
    }
  }

  static async create(request: NextRequest): Promise<NextResponse> {
    try {
      const createDto = (await request.json()) as CreatePostDto
      const validData = validateSchema<Partial<Post>>(PostSchema, createDto)
      if (validData.success) {
        const existing = await prisma.post.findFirst({
          where: {
            deletedAt: null,
            OR: [{ name: createDto.name }, { code: createDto.code }],
          },
        })
        if (existing) {
          return ResponseUtil.businessError(
            ResponseCode.RESOURCE_EXISTS,
            '岗位已存在',
          )
        }
        const create = await prisma.post.create({
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
          '岗位ID不能为空',
        )
      }
      const existing = await prisma.post.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      })
      if (!existing) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '岗位不存在',
        )
      }
      const updateDto = (await request.json()) as UpdatePostDto
      const validData = validateSchema<Partial<Post>>(PostSchema, updateDto)
      if (!validData.success) {
        return ResponseUtil.businessValidError(validData.errors)
      }

      const conflict = await prisma.post.findFirst({
        where: {
          deletedAt: null,
          OR: [{ name: updateDto.name }, { code: updateDto.code }],
          NOT: { id },
        },
      })

      if (conflict) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '岗位名称或岗位编码已存在',
        )
      }
      const updated = await prisma.post.update({
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
          '岗位ID不能为空',
        )
      }
      const existing = await prisma.post.findUnique({
        where: {
          id,
          deletedAt: null,
        },
      })
      if (!existing) {
        return ResponseUtil.businessError(
          ResponseCode.RESOURCE_EXISTS,
          '岗位不存在',
        )
      }
      await prisma.post.update({
        where: {
          id,
          deletedAt: null,
        },
        data: {
          deletedAt: new Date(),
        },
      })

      return ResponseUtil.success(null, '删除岗位成功')
    } catch (error: any) {
      console.log(error)
      return ResponseUtil.serverError(error.message)
    }
  }
}
