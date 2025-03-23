'use client'

import React, { useState, useEffect } from 'react'
import { Layout, Menu } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  KeyOutlined,
  GlobalOutlined,
  TagsOutlined,
  AppstoreOutlined,
  DashboardOutlined,
} from '@ant-design/icons'
import { usePathname, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'

const { Sider } = Layout

type MenuItem = {
  key: string
  icon: React.ReactNode
  label: string
  children?: MenuItem[]
  permission?: string
}

interface SidebarProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export default function Sidebar({ collapsed, setCollapsed }: SidebarProps) {
  const pathname = usePathname()
  const router = useRouter()
  const { data: session } = useSession()
  const [selectedKeys, setSelectedKeys] = useState<string[]>([])

  // 根据当前路径设置选中的菜单项
  useEffect(() => {
    const pathParts = pathname.split('/')
    if (pathParts.length >= 3) {
      setSelectedKeys([pathParts[2]])
    }
  }, [pathname])

  // 检查用户是否有权限访问某个菜单项
  const hasPermission = (permissionName?: string) => {
    if (!permissionName) return true
    if (!session?.user?.permissions) return false

    return (session.user.permissions as any[]).some(
      (p) => p.name === permissionName,
    )
  }

  // 菜单项定义
  const menuItems: MenuItem[] = [
    {
      key: 'dashboard',
      icon: <DashboardOutlined />,
      label: '仪表盘',
    },
    {
      key: 'users',
      icon: <UserOutlined />,
      label: '用户管理',
      permission: 'user:read',
    },
    {
      key: 'roles',
      icon: <TeamOutlined />,
      label: '角色管理',
      permission: 'role:read',
    },
    {
      key: 'permissions',
      icon: <KeyOutlined />,
      label: '权限管理',
      permission: 'permission:read',
    },
    {
      key: 'sites',
      icon: <GlobalOutlined />,
      label: '站点管理',
      permission: 'site:read',
    },
    {
      key: 'categories',
      icon: <AppstoreOutlined />,
      label: '分类管理',
      permission: 'category:read',
    },
    {
      key: 'tags',
      icon: <TagsOutlined />,
      label: '标签管理',
      permission: 'tag:read',
    },
  ]

  // 过滤掉用户没有权限的菜单项
  const filteredMenuItems = menuItems.filter((item) =>
    hasPermission(item.permission),
  )

  // 处理菜单点击事件
  const handleMenuClick = ({ key }: { key: string }) => {
    router.push(`/admin/${key}`)
  }

  return (
    <Sider
      collapsible
      collapsed={collapsed}
      onCollapse={(value) => setCollapsed(value)}
      style={{ minHeight: '100vh' }}
    >
      <div
        style={{
          height: 32,
          margin: 16,
          background: 'rgba(255, 255, 255, 0.2)',
        }}
      />
      <Menu
        theme="dark"
        mode="inline"
        selectedKeys={selectedKeys}
        items={filteredMenuItems}
        onClick={handleMenuClick}
      />
    </Sider>
  )
}
