import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@/types/user'

type UserState = {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  permissions: string[]
  roles: string[]
  // 操作方法
  setUser: (user: User | null) => void
  setToken: (token: string | null) => void
  setPermissions: (permissions: string[]) => void
  setRoles: (roles: string[]) => void
  login: (user: User, token: string) => void
  logout: () => void
}

export const useUserStore = create<UserState>(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      permissions: [],
      roles: [],

      setUser: (user) => set({ user, isAuthenticated: !!user }),
      setToken: (token) => set({ token }),
      setPermissions: (permissions) => set({ permissions }),
      setRoles: (roles) => set({ roles }),

      login: (user, token) =>
        set({
          user,
          token,
          isAuthenticated: true,
          permissions:
            user.roles?.flatMap(
              (r) => r.role.permissions?.map((p) => p.permission.code) || [],
            ) || [],
          roles: user.roles?.map((r) => r.role.code) || [],
        }),

      logout: () =>
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          permissions: [],
          roles: [],
        }),
    }),
    {
      name: 'user-storage', // 持久化存储的键名
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
        roles: state.roles,
      }),
    },
  ),
)
