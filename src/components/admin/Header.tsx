'use client'

import React from 'react'
import { Layout, Button, Dropdown, Avatar, Space, Typography } from 'antd'
import {
  UserOutlined,
  LogoutOutlined,
  MenuUnfoldOutlined,
  MenuFoldOutlined,
} from '@ant-design/icons'
import { signOut, useSession } from 'next-auth/react'
import type { MenuProps } from 'antd'

const { Header } = Layout
const { Text } = Typography

interface AdminHeaderProps {
  collapsed: boolean
  setCollapsed: (collapsed: boolean) => void
}

export default function AdminHeader({
  collapsed,
  setCollapsed,
}: AdminHeaderProps) {
  const { data: session } = useSession()

  const handleLogout = () => {
    signOut({ callbackUrl: '/login' })
  }

  const items: MenuProps['items'] = [
    {
      key: 'logout',
      label: '退出登录',
      icon: <LogoutOutlined />,
      onClick: handleLogout,
    },
  ]

  return (
    <Header
      style={{
        padding: 0,
        background: '#fff',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <Button
        type="text"
        icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
        onClick={() => setCollapsed(!collapsed)}
        style={{ fontSize: '16px', width: 64, height: 64 }}
      />
      <div style={{ marginRight: 24 }}>
        <Dropdown menu={{ items }} placement="bottomRight">
          <Space>
            <Avatar icon={<UserOutlined />} src={session?.user?.avatar} />
            <Text>{session?.user?.account || '未登录'}</Text>
          </Space>
        </Dropdown>
      </div>
    </Header>
  )
}
