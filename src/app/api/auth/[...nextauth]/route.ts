import NextAuth from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { prisma } from '@/lib/prisma'
import { compare } from 'bcrypt'

// NextAuth配置
const handler = NextAuth({
  providers: [
    CredentialsProvider({
      name: 'Credentials',
      credentials: {
        account: { label: '账号', type: 'text' },
        password: { label: '密码', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.account || !credentials?.password) {
          return null
        }

        // 查找用户
        const user = await prisma.user.findUnique({
          where: { account: credentials.account },
          include: {
            roles: {
              include: {
                role: {
                  include: {
                    permissions: {
                      include: {
                        permission: true,
                      },
                    },
                  },
                },
              },
            },
          },
        })

        if (!user) {
          return null
        }

        // 验证密码
        const isPasswordValid = await compare(
          credentials.password,
          user.password,
        )

        if (!isPasswordValid) {
          return null
        }

        // 提取权限信息
        const permissions = user.roles.flatMap((userRole) =>
          userRole.role.permissions.map((rp) => ({
            id: rp.permission.id,
            type: rp.permission.type,
            name: rp.permission.name,
          })),
        )

        // 提取角色信息
        const roles = user.roles.map((userRole) => ({
          id: userRole.role.id,
          name: userRole.role.name,
        }))

        // 返回用户信息（不包含密码）
        return {
          id: user.id,
          account: user.account,
          email: user.email,
          avatar: user.avatar,
          roles,
          permissions,
        }
      },
    }),
  ],
  callbacks: {
    // 将用户角色和权限信息添加到会话中
    async session({ session, token }) {
      if (token) {
        session.user = {
          ...session.user,
          id: token.id as string,
          roles: token.roles as any[],
          permissions: token.permissions as any[],
        }
      }
      return session
    },
    // 将用户角色和权限信息添加到JWT令牌中
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id
        token.roles = user.roles
        token.permissions = user.permissions
      }
      return token
    },
  },
  pages: {
    signIn: '/login', // 自定义登录页面路径
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30天
  },
  secret: process.env.NEXTAUTH_SECRET,
})

export { handler as GET, handler as POST }
