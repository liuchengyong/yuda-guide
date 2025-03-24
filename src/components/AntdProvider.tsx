'use client'

import React from 'react'
import { ConfigProvider } from 'antd'
import { StyleProvider } from '@ant-design/cssinjs'
import themeConfig from '@/theme/themeConfig'
import { AntdRegistry } from '@ant-design/nextjs-registry'

export default function AntdProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AntdRegistry>
      <StyleProvider hashPriority="high">
        <ConfigProvider theme={themeConfig}>{children}</ConfigProvider>
      </StyleProvider>
    </AntdRegistry>
  )
}
