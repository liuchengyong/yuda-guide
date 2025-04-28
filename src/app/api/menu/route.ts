import { MenuService } from '@/modules/menu/menu.service'
import { NextRequest } from 'next/server'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  if (searchParams.get('methed') == 'tree-select') {
    return MenuService.getAllTreeSelect()
  }

  return MenuService.getAll()
}

export async function POST(request: NextRequest) {
  return MenuService.create(request)
}

export async function PUT(request: NextRequest) {
  return MenuService.update(request)
}

// 删除权限
export async function DELETE(request: NextRequest) {
  return MenuService.delete(request)
}

export const dynamic = 'force-dynamic'
