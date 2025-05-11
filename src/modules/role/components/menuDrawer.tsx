'use client'

import { buildTree } from '@/lib/utils'
import { request } from '@/modules/http/request'
import { Menu, SearchMenuDto } from '@/modules/menu/menu.type'
import { DrawerForm, ProFormInstance } from '@ant-design/pro-form'
import { ActionType } from '@ant-design/pro-table'
import { App, Form, TreeDataNode } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { Role } from '../role.type'
import MenuTree from './menuTree'

export interface MenuDrawerEditProps {
  currentRecord: Role | null
  open: boolean
  onOpenChange: (visible: boolean) => void
  actionRef: React.RefObject<ActionType | null>
}

export const MenuDrawerEdit: React.FC<MenuDrawerEditProps> = (props) => {
  const { currentRecord, open, onOpenChange, actionRef } = props
  const { modal, notification } = App.useApp()
  const formRef = useRef<ProFormInstance<Partial<Role>>>(null)
  const [treeData, setTreeData] = useState<TreeDataNode[]>([])

  useEffect(() => {
    if (open && currentRecord) {
      request.get<SearchMenuDto, Menu>('/api/menu/list').then((response) => {
        let datas: TreeDataNode[] = []
        let rootMenus: Menu[] = []
        response.datas?.forEach((item) => {
          if (!response.datas?.some((item1) => item.parentId == item1.id)) {
            rootMenus.push(item)
          }
        })
        rootMenus.forEach((item) => {
          let treeDataNode: TreeDataNode = {
            title: item.name,
            key: item.id,
            isLeaf: false,
            children: [],
          }
          const children = buildTree<Menu, TreeDataNode>(
            response.datas || [],
            item.id,
            (item, children) => {
              return {
                title: item.name,
                key: item.id,
                isLeaf: children && children.length > 0 ? false : true,
                children: children,
              }
            },
          )
          if (!item.parentId) {
            datas = datas.concat(children || [])
          } else {
            treeDataNode.children = children
            datas.push(treeDataNode)
          }
        })
        setTreeData(datas)
      })
      request
        .get<null, Partial<Role>>(`/api/role/${currentRecord.id}`)
        .then((response) => {
          if (response.data) {
            formRef.current?.setFieldsValue(response.data)
          }
        })
    }
  }, [open, currentRecord])

  // 处理角色表单提交
  const handleFinish = async (values: Partial<Role>) => {
    console.log(values)
    if (currentRecord) {
      try {
        const response = await request.put<Partial<Role>, Role>(
          `/api/role/${currentRecord?.id}/menu`,
          values,
        )

        if (response.code === 0) {
          notification.success({
            message: '更新角色成功',
          })
          actionRef.current?.reload()
          return true
        } else {
          notification.error({
            message: response.message || '更新角色失败',
          })
          return false
        }
      } catch (error) {
        console.error('更新角色失败:', error)
        return false
      }
    }
  }

  return (
    <DrawerForm<Partial<Role>>
      title={'菜单权限'}
      open={open}
      width={500}
      onOpenChange={onOpenChange}
      formRef={formRef}
      drawerProps={{
        destroyOnClose: true,
      }}
      onFinish={handleFinish}
    >
      <Form.Item name="menuIds" label="菜单权限">
        <MenuTree treeData={treeData}></MenuTree>
      </Form.Item>
    </DrawerForm>
  )
}
