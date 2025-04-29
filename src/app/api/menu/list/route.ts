import { MenuService } from '@/modules/menu/menu.service'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  return MenuService.getList(request)
}
