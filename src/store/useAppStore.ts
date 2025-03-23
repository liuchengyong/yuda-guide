import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Site } from '@/types/site'

type AppState = {
  // 应用配置
  appName: string
  appLogo: string
  appDescription: string
  // 导航站点
  sites: Site[]
  // 操作方法
  setAppName: (name: string) => void
  setAppLogo: (logo: string) => void
  setAppDescription: (description: string) => void
  setSites: (sites: Site[]) => void
  addSite: (site: Site) => void
  updateSite: (id: string, site: Partial<Site>) => void
  removeSite: (id: string) => void
}

export const useAppStore = create<AppState>(
  persist(
    (set) => ({
      appName: '个人导航',
      appLogo: '/logo.png',
      appDescription: '一个简单的个人导航网站',
      sites: [],

      setAppName: (appName) => set({ appName }),
      setAppLogo: (appLogo) => set({ appLogo }),
      setAppDescription: (appDescription) => set({ appDescription }),
      setSites: (sites) => set({ sites }),

      addSite: (site) =>
        set((state) => ({
          sites: [...state.sites, site],
        })),

      updateSite: (id, updatedSite) =>
        set((state) => ({
          sites: state.sites.map((site) =>
            site.id === id ? { ...site, ...updatedSite } : site,
          ),
        })),

      removeSite: (id) =>
        set((state) => ({
          sites: state.sites.filter((site) => site.id !== id),
        })),
    }),
    {
      name: 'app-storage', // 持久化存储的键名
    },
  ),
)
