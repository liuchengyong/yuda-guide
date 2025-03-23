import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

// 需要保护的API路径前缀
const PROTECTED_API_PATHS = [
  '/api/users',
  '/api/roles',
  '/api/permissions',
  '/api/sites',
  '/api/tags',
  '/api/categories',
]

// 权限映射表，定义不同API路径和HTTP方法所需的权限
const PERMISSION_MAP: Record<string, Record<string, string>> = {
  '/api/users': {
    GET: 'user:read',
    POST: 'user:create',
    PUT: 'user:update',
    DELETE: 'user:delete',
  },
  '/api/roles': {
    GET: 'role:read',
    POST: 'role:create',
    PUT: 'role:update',
    DELETE: 'role:delete',
  },
  '/api/permissions': {
    GET: 'permission:read',
    POST: 'permission:create',
    PUT: 'permission:update',
    DELETE: 'permission:delete',
  },
  '/api/sites': {
    GET: 'site:read',
    POST: 'site:create',
    PUT: 'site:update',
    DELETE: 'site:delete',
  },
  '/api/tags': {
    GET: 'tag:read',
    POST: 'tag:create',
    PUT: 'tag:update',
    DELETE: 'tag:delete',
  },
  '/api/categories': {
    GET: 'category:read',
    POST: 'category:create',
    PUT: 'category:update',
    DELETE: 'category:delete',
  },
}

// 中间件函数
export async function middleware(request: NextRequest) {
  // 获取请求路径和方法
  const path = request.nextUrl.pathname
  const method = request.method

  // 检查是否是需要保护的API路径
  const isProtectedPath = PROTECTED_API_PATHS.some((prefix) =>
    path.startsWith(prefix),
  )

  // 如果不是受保护的路径，直接放行
  if (!isProtectedPath) {
    return NextResponse.next()
  }

  // 如果是认证相关的路径，直接放行
  if (path.startsWith('/api/auth')) {
    return NextResponse.next()
  }

  // 获取JWT令牌
  const token = await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })

  // 如果没有令牌，表示用户未登录，返回401错误
  if (!token) {
    return new NextResponse(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 获取用户权限
  const userPermissions = (token.permissions as Array<{ name: string }>) || []
  const permissionNames = userPermissions.map((p) => p.name)

  // 查找当前路径和方法所需的权限
  let requiredPermission: string | undefined

  // 处理详情路径，如 /api/users/[id]
  const basePath = PROTECTED_API_PATHS.find((prefix) => path.startsWith(prefix))
  if (basePath) {
    requiredPermission = PERMISSION_MAP[basePath]?.[method]
  }

  // 如果找不到所需权限，默认放行（可以根据需求调整为拒绝）
  if (!requiredPermission) {
    return NextResponse.next()
  }

  // 检查用户是否拥有所需权限
  const hasPermission = permissionNames.includes(requiredPermission)

  // 如果没有所需权限，返回403错误
  if (!hasPermission) {
    return new NextResponse(JSON.stringify({ error: 'Forbidden' }), {
      status: 403,
      headers: { 'Content-Type': 'application/json' },
    })
  }

  // 有权限，放行请求
  return NextResponse.next()
}

// 配置中间件匹配的路径
export const config = {
  matcher: [
    /*
     * 匹配所有的API路径，除了next-auth的路径
     * (?!_next)(?!api\/auth) - 不匹配_next和api/auth路径
     * (.*)                   - 匹配任何其他路径
     */
    '/api/:path*',
  ],
}
