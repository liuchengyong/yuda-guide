'use client'

import React, { useState } from 'react'
import {
  getMenuData,
  MenuDataItem,
  ProBreadcrumb,
} from '@ant-design/pro-layout'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
const menuData: MenuDataItem[] = [
  {
    name: '系统管理',
    children: [
      {
        path: 'system/menu',
        name: '菜单管理',
      },
    ],
  },
]

const DynamicProLayout = dynamic(
  () => import('@ant-design/pro-layout').then((mod) => mod.ProLayout),
  { ssr: false },
)

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname() // 获取当前路径
  const router = useRouter() // 用于路由跳转

  return (
    <DynamicProLayout
      title="yuda"
      logo="/logo.webp"
      layout="mix"
      location={{
        pathname,
      }}
      route={{
        path: '/',
        routes: menuData,
      }}
      menuItemRender={(item, dom) => <Link href={item.path || ''}>{dom}</Link>}
      collapsed={collapsed}
      onCollapse={setCollapsed}
    >
      {children}
    </DynamicProLayout>
  )
}
