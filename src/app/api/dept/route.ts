import { DeptService } from '@/modules/dept/dept.service'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return DeptService.create(request)
}
