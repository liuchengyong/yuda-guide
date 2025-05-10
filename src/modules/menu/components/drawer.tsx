'use client'

import IconPicker from '@/components/IconPicker'
import { buildTree } from '@/lib/utils'
import { request } from '@/modules/http/request'
import {
  DrawerForm,
  ProFormDigit,
  ProFormInstance,
  ProFormRadio,
  ProFormSwitch,
  ProFormText,
  ProFormTreeSelect,
} from '@ant-design/pro-form'
import { ActionType } from '@ant-design/pro-table'
import { App, Form } from 'antd'
import { DataNode } from 'antd/lib/tree'
import React, { useEffect, useRef } from 'react'
import {
  Menu,
  MENU_STATUS_OPTIONS,
  MENU_TYPE_OPTIONS,
  MenuStatus,
  MenuTreeVo,
  MenuType,
} from '../menu.type'

export interface DrawerEditProps {
  currentRecord: Menu | null
  open: boolean
  onOpenChange: (visible: boolean) => void
  actionRef: React.RefObject<ActionType | null>
}

export const DrawerEdit: React.FC<DrawerEditProps> = (props) => {
  const { currentRecord, open, onOpenChange, actionRef } = props
  const { notification } = App.useApp()
  const formRef = useRef<ProFormInstance<Partial<Menu>>>(null)

  useEffect(() => {
    if (open && currentRecord) {
      formRef.current?.setFieldsValue(currentRecord)
    }
  }, [open, currentRecord])
  // 处理创建菜单
  const handleCreate = async (values: Partial<Menu>) => {
    try {
      const response = await request.post<Partial<Menu>, Menu>(
        '/api/menu',
        values,
      )
      if (response.code === 0) {
        notification.success({
          message: '创建菜单成功',
        })
        actionRef.current?.reload()
        return true
      } else {
        notification.error({
          message: response.message || '创建菜单失败',
        })
        return false
      }
    } catch (error) {
      console.error('创建菜单失败:', error)
      return false
    }
  }

  // 处理更新菜单
  const handleUpdate = async (values: Partial<Menu>) => {
    try {
      const response = await request.put<Partial<Menu>, Menu>(
        `/api/menu/${currentRecord?.id}`,
        values,
      )

      if (response.code === 0) {
        notification.success({
          message: '更新菜单成功',
        })
        actionRef.current?.reload()
        return true
      } else {
        notification.error({
          message: response.message || '更新菜单失败',
        })
        return false
      }
    } catch (error) {
      console.error('更新菜单失败:', error)
      return false
    }
  }

  // 处理菜单表单提交
  const handleFinish = async (values: Partial<Menu>) => {
    if (currentRecord) {
      return handleUpdate(values)
    } else {
      return handleCreate(values)
    }
  }

  const treeSelectRequest = async () => {
    const response = await request.get<{}, MenuTreeVo>('/api/menu/simpleList')
    if (currentRecord) {
      response.datas = response.datas?.filter(
        (item) => item.id !== currentRecord?.id,
      )
    }
    const treeSelectDatas = buildTree<MenuTreeVo, DataNode>(
      response.datas || [],
      null,
      (item) => {
        return {
          key: item.id,
          value: item.id,
          label: item.name,
        }
      },
    )
    return treeSelectDatas
  }

  return (
    <DrawerForm<Partial<Menu>>
      title={currentRecord ? '编辑菜单' : '创建菜单'}
      open={open}
      width={500}
      onOpenChange={onOpenChange}
      formRef={formRef}
      autoFocusFirstInput
      drawerProps={{
        destroyOnClose: true,
      }}
      onFinish={handleFinish}
    >
      <ProFormTreeSelect
        name="parentId"
        label="父级菜单"
        rules={[{ required: true, message: '请选择父级菜单' }]}
        request={treeSelectRequest}
      />

      <ProFormText
        name="name"
        label="菜单名称"
        placeholder="请输入菜单名称"
        rules={[
          { required: true, message: '请输入菜单名称' },
          {
            type: 'string',
            min: 1,
            max: 20,
            message: '菜单名不能超过20个字符',
          },
        ]}
      />
      <ProFormRadio.Group
        name="type"
        label="菜单类型"
        initialValue={MenuType.DIR}
        options={MENU_TYPE_OPTIONS}
        rules={[{ required: true, message: '请选择菜单类型' }]}
      />
      <ProFormText
        name="code"
        label="权限码"
        placeholder={`请输入权限码`}
        rules={[
          { required: true, message: '请输入权限码' },
          {
            type: 'string',
            min: 1,
            max: 300,
            message: '权限编码不能超过300个字符',
          },
        ]}
      />
      <Form.Item name="icon" label="图标">
        <IconPicker />
      </Form.Item>
      <ProFormText name="path" label="路径" placeholder="请输入路径" />
      <ProFormDigit
        name="sort"
        label="排序"
        placeholder="请输入排序"
        min={0}
        max={10000}
        fieldProps={{
          precision: 0,
        }}
        rules={[{ required: true, message: '请输入排序' }]}
      />

      <ProFormRadio.Group
        name="status"
        label="菜单状态"
        initialValue={MenuStatus.ENABLED}
        options={MENU_STATUS_OPTIONS}
        rules={[{ required: true, message: '请选择菜单状态' }]}
      />

      <ProFormSwitch name="visible" initialValue={true} label="显示状态" />
    </DrawerForm>
  )
}
