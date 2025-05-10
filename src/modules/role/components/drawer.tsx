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
import { App, Button, Form, Space, Tag } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { request } from '@/modules/http/request'
import { Role } from '../role.type'

export interface DrawerEditProps {
  currentRecord: Role | null
  open: boolean
  onOpenChange: (visible: boolean) => void
  actionRef: React.RefObject<ActionType | null>
}

export const DrawerEdit: React.FC<DrawerEditProps> = (props) => {
  const { currentRecord, open, onOpenChange, actionRef } = props
  const { modal, notification } = App.useApp()
  const formRef = useRef<ProFormInstance<Partial<Role>>>(null)

  useEffect(() => {
    if (open && currentRecord) {
      formRef.current?.setFieldsValue(currentRecord)
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
      title={currentRecord ? '编辑角色' : '创建角色'}
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
      <ProFormText
        name="name"
        label="角色名称"
        placeholder="请输入角色名称"
        rules={[
          { required: true, message: '请输入角色名称' },
          {
            type: 'string',
            min: 1,
            max: 20,
            message: '角色名不能超过20个字符',
          },
        ]}
      />

      <ProFormText
        name="code"
        label="角色编码"
        placeholder={`请输入角色编码`}
        rules={[
          { required: true, message: '请输入角色编码' },
          {
            type: 'string',
            min: 1,
            max: 300,
            message: '角色编码不能超过300个字符',
          },
        ]}
      />
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
        label="角色状态"
        initialValue={RoleStatus.ENABLED}
        options={ROLE_STATUS_CONFIG}
        rules={[{ required: true, message: '请选择角色状态' }]}
      />

      <ProFormTextArea
        name="description"
        label="备注"
        rules={[
          {
            type: 'string',
            min: 0,
            max: 1000,
            message: '角色编码不能超过300个字符',
          },
        ]}
      />
    </DrawerForm>
  )
}
