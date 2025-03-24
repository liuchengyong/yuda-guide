import { NextRequest } from 'next/server'
import { validateSchema } from '@/lib/validations'
import { PermissionService } from '@/modules/permission/permission.service'
import {
  CreatePermissionDto,
  CreatePermissionDtoSchema,
} from '@/modules/permission/permission.model'
import { ResponseUtil } from '@/modules/http/response.util'

// 获取所有权限
export async function GET(request: NextRequest) {}

// 创建权限
export async function POST(request: NextRequest) {
  return PermissionService.createPermission(request)
  try {
    const body = (await request.json()) as CreatePermissionDto
    const validData = validateSchema(CreatePermissionDtoSchema, body)
    if (validData.success) {
      return PermissionService.createPermission(body)
    } else {
      return ResponseUtil.badRequest()
    }
  } catch (error: any) {
    console.log(error)
    return ResponseUtil.badRequest(error.message)
  }
}
