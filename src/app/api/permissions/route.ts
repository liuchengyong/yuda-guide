import { NextRequest } from 'next/server'
import { PermissionService } from '@/modules/permission/permission.service'

// 获取所有权限
export async function GET(request: NextRequest) {
  return PermissionService.getPermissions(request)
}

// 创建权限
export async function POST(request: NextRequest) {
  return PermissionService.createPermission(request)
}

// 更新权限
export async function PUT(request: NextRequest) {
  return PermissionService.updatePermission(request)
}

// 删除权限
export async function DELETE(request: NextRequest) {
  return PermissionService.deletePermission(request)
}
