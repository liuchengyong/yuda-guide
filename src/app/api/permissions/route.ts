import { NextRequest } from 'next/server'
import {
  CreatePermissionDto,
  CreatePermissionDtoSchema,
} from '@/types/entitys/permission'
import { validateSchema } from '@/lib/validations'
import { ResponseUtils } from '@/lib/responseUtils'
import { PermissionService } from '@/services/permission.service'

// 获取所有权限
export async function GET(request: NextRequest) {}

// 创建权限
export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as CreatePermissionDto
    const validData = validateSchema(CreatePermissionDtoSchema, body)
    const a: any = [1, 2][10]
    const c = a.b
    if (validData.success) {
      return PermissionService.createPermission(body)
    } else {
      return ResponseUtils.badRequest()
    }
  } catch (error: any) {
    console.log(error)
    return ResponseUtils.badRequest(error.message)
  }
}
