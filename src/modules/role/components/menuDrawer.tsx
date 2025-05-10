'use client'

import { ActionType } from '@ant-design/pro-table'
import {
  DrawerForm,
  ProFormDigit,
  ProFormInstance,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form'
import { App, Button, Form, Space, Tag, Tree } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { request } from '@/modules/http/request'
import { Role } from '../role.type'

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

  useEffect(() => {
    if (open && currentRecord) {
      // formRef.current?.setFieldsValue(currentRecord)
    }
  }, [open, currentRecord])
  // 处理创建角色
  const handleCreate = async (values: Partial<Role>) => {
    try {
      const response = await request.post<Partial<Role>, Role>(
        '/api/role',
        values,
      )
      if (response.code === 0) {
        notification.success({
          message: '创建角色成功',
        })
        actionRef.current?.reload()
        return true
      } else {
        notification.error({
          message: response.message || '创建角色失败',
        })
        return false
      }
    } catch (error) {
      console.error('创建角色失败:', error)
      return false
    }
  }

  // 处理更新角色
  const handleUpdate = async (values: Partial<Role>) => {
    try {
      const response = await request.put<Partial<Role>, Role>(
        `/api/role/${currentRecord?.id}`,
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

  // 处理角色表单提交
  const handleFinish = async (values: Partial<Role>) => {
    if (currentRecord) {
      return handleUpdate(values)
    } else {
      return handleCreate(values)
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
        <Tree checkable></Tree>
      </Form.Item>
    </DrawerForm>
  )
}
