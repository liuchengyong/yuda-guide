import { MenuService } from '@/modules/menu/menu.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  return MenuService.getSimpleList()
}
