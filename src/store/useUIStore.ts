import { create } from 'zustand'
import { persist } from 'zustand/middleware'

type UIState = {
  // 侧边栏状态
  sidebarCollapsed: boolean
  // 主题设置
  theme: 'light' | 'dark' | 'system'
  // 操作方法
  toggleSidebar: () => void
  setSidebarCollapsed: (collapsed: boolean) => void
  setTheme: (theme: 'light' | 'dark' | 'system') => void
}

export const useUIStore = create<UIState>(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      theme: 'light',

      toggleSidebar: () =>
        set((state) => ({ sidebarCollapsed: !state.sidebarCollapsed })),
      setSidebarCollapsed: (collapsed) => set({ sidebarCollapsed: collapsed }),
      setTheme: (theme) => set({ theme }),
    }),
    {
      name: 'ui-storage', // 持久化存储的键名
    },
  ),
)
