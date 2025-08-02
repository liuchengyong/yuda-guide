import { UserService } from '@/modules/user/user.service'
import { NextRequest } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  return UserService.create(request)
}
