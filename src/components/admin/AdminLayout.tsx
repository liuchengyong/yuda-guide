'use client'

import React from 'react'
import { Layout } from 'antd'
import Sidebar from './Sidebar'
import AdminHeader from './Header'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { useUIStore } from '@/store/useUIStore'

const { Content } = Layout

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { data: session, status } = useSession()
  const router = useRouter()
  const { sidebarCollapsed, setSidebarCollapsed } = useUIStore()

  // 如果用户未登录，重定向到登录页面
  React.useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login')
    }
  }, [status, router])

  // 如果正在加载会话信息，显示加载状态
  if (status === 'loading') {
    return <div>Loading...</div>
  }

  // 如果用户未登录，不渲染内容
  if (status === 'unauthenticated') {
    return null
  }

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Sidebar
        collapsed={sidebarCollapsed}
        setCollapsed={setSidebarCollapsed}
      />
      <Layout>
        <AdminHeader
          collapsed={sidebarCollapsed}
          setCollapsed={setSidebarCollapsed}
        />
        <Content
          style={{
            margin: '24px 16px',
            padding: 24,
            background: '#fff',
            minHeight: 280,
          }}
        >
          {children}
        </Content>
      </Layout>
    </Layout>
  )
}
