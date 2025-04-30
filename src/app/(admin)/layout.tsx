'use client'

import React, { useState } from 'react'
import { MenuDataItem } from '@ant-design/pro-layout'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { Menu, MenuTreeVo } from '@/modules/menu/menu.model'
import { request } from '@/modules/http/request'
import { buildTree } from '@/lib/utils'
import Icon from '@/components/Icon'

const DynamicProLayout = dynamic(
  () => import('@ant-design/pro-layout').then((mod) => mod.ProLayout),
  { ssr: false },
)

export default function Layout({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname() // 获取当前路径
  const router = useRouter() // 用于路由跳转

  const menuRequest = async () => {
    const response = await request.get<{}, Menu>('/api/menu/list')
    const treeSelectDatas = buildTree<Menu, MenuDataItem>(
      response.datas || [],
      null,
      (item) => {
        return {
          key: item.id,
          name: item.name,
          path: item.path || '',
          icon: <Icon value={item.icon || ''}></Icon>,
        }
      },
    )
    let datas: MenuDataItem[] = []
    treeSelectDatas.forEach((item) => {
      datas = datas.concat(item.children || [])
    })
    console.log(datas)
    return datas
  }

  return (
    <DynamicProLayout
      title="yuda"
      logo="/logo.webp"
      layout="mix"
      location={{
        pathname,
      }}
      menu={{
        request: menuRequest,
      }}
      menuItemRender={(item, dom) => <Link href={item.path || ''}>{dom}</Link>}
      collapsed={collapsed}
      onCollapse={setCollapsed}
    >
      {children}
    </DynamicProLayout>
  )
}
