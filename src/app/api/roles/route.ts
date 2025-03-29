import { NextRequest, NextResponse } from 'next/server'
import { RoleService } from '@/modules/role/role.service'

/**
 * 处理GET请求，获取角色列表
 */
export async function GET(request: NextRequest): Promise<NextResponse> {
  return await RoleService.getRoles(request)
}

/**
 * 处理POST请求，创建角色
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  return await RoleService.createRole(request)
}

/**
 * 处理PUT请求，更新角色
 */
export async function PUT(request: NextRequest): Promise<NextResponse> {
  return await RoleService.updateRole(request)
}

/**
 * 处理DELETE请求，删除角色
 */
export async function DELETE(request: NextRequest): Promise<NextResponse> {
  return await RoleService.deleteRole(request)
}
