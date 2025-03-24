'use client'

import React, { useState } from 'react'
import ProLayout, { MenuDataItem, PageContainer } from '@ant-design/pro-layout'
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

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  return (
    <ProLayout
      title="yuda-guide"
      logo="/logo.webp"
      layout="mix"
      menuDataRender={() => menuData}
      collapsed={collapsed}
      onCollapse={setCollapsed}
    >
      {children}
    </ProLayout>
  )
}
