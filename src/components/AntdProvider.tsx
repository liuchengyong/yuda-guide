'use client'

import React from 'react'
import { App, ConfigProvider } from 'antd'
import { StyleProvider } from '@ant-design/cssinjs'
import themeConfig from '@/theme/themeConfig'
import { AntdRegistry } from '@ant-design/nextjs-registry'
import '@ant-design/v5-patch-for-react-19'

export default function AntdProvider({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <AntdRegistry>
      <StyleProvider hashPriority="high">
        <ConfigProvider theme={themeConfig}>
          <App>{children}</App>
        </ConfigProvider>
      </StyleProvider>
    </AntdRegistry>
  )
}
