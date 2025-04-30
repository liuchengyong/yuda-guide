import { DeptService } from '@/modules/dept/dept.service'

export const dynamic = 'force-dynamic'

export async function GET() {
  return DeptService.getSimpleList()
}
