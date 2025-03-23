import { DefaultSession, DefaultUser } from 'next-auth'
import { JWT } from 'next-auth/jwt'

// 扩展默认的用户类型
declare module 'next-auth' {
  interface User extends DefaultUser {
    id: string
    account: string
    roles: Array<{ id: string; name: string }>
    permissions: Array<{ id: string; type: string; name: string }>
  }

  interface Session extends DefaultSession {
    user: {
      id: string
      account: string
      roles: Array<{ id: string; name: string }>
      permissions: Array<{ id: string; type: string; name: string }>
    } & DefaultSession['user']
  }
}

// 扩展JWT类型
declare module 'next-auth/jwt' {
  interface JWT {
    id: string
    roles: Array<{ id: string; name: string }>
    permissions: Array<{ id: string; type: string; name: string }>
  }
}
