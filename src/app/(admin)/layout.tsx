'use client'

import React, { useState } from 'react'
import { MenuDataItem } from '@ant-design/pro-layout'
import dynamic from 'next/dynamic'
const menuData: MenuDataItem[] = [
  {
    path: '/welcome',
    name: 'Welcome',
    icon: 'dashboard',
  },
  {
    path: '/admin',
    name: 'Admin',
    children: [
      {
        path: '/admin/sub-page1',
        name: 'Sub Page 1',
      },
      {
        path: '/admin/sub-page2',
        name: 'Sub Page 2',
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
  return (
    <DynamicProLayout
      title="yuda-guide"
      logo="/logo.webp"
      layout="mix"
      menuDataRender={() => menuData}
      collapsed={collapsed}
      onCollapse={setCollapsed}
    >
      {children}
    </DynamicProLayout>
  )
}
