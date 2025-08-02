'use client'

import { Status, STATUS_CONFIG } from '@/modules/common/base.type'
import { request } from '@/modules/http/request'
import {
  DrawerForm,
  ProFormDigit,
  ProFormInstance,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form'
import { ActionType } from '@ant-design/pro-table'
import { App } from 'antd'
import React, { useEffect, useRef } from 'react'
import { CreateUserDto, UpdateUserDto, UserVo } from '../user.type'

export interface DrawerEditProps {
  currentRecord: UserVo | null
  open: boolean
  onOpenChange: (visible: boolean) => void
  actionRef: React.RefObject<ActionType | null>
}

export const DrawerEdit: React.FC<DrawerEditProps> = (props) => {
  const { currentRecord, open, onOpenChange, actionRef } = props
  const { modal, notification } = App.useApp()
  const formRef = useRef<ProFormInstance<Partial<UserVo>>>(null)

  useEffect(() => {
    if (open && currentRecord) {
      formRef.current?.setFieldsValue(currentRecord)
    }
  }, [open, currentRecord])
  // 处理创建用户
  const handleCreate = async (values: CreateUserDto) => {
    try {
      const response = await request.post<CreateUserDto, UserVo>(
        '/api/role',
        values,
      )
      if (response.code === 0) {
        notification.success({
          message: '创建用户成功',
        })
        actionRef.current?.reload()
        return true
      } else {
        notification.error({
          message: response.message || '创建用户失败',
        })
        return false
      }
    } catch (error) {
      console.error('创建用户失败:', error)
      return false
    }
  }

  // 处理更新用户
  const handleUpdate = async (values: UpdateUserDto) => {
    try {
      const response = await request.put<UpdateUserDto, UserVo>(
        `/api/role/${currentRecord?.id}`,
        values,
      )

      if (response.code === 0) {
        notification.success({
          message: '更新用户成功',
        })
        actionRef.current?.reload()
        return true
      } else {
        notification.error({
          message: response.message || '更新用户失败',
        })
        return false
      }
    } catch (error) {
      console.error('更新用户失败:', error)
      return false
    }
  }

  // 处理用户表单提交
  const handleFinish = async (values: CreateUserDto & UpdateUserDto) => {
    if (currentRecord) {
      return handleUpdate(values as UpdateUserDto)
    } else {
      return handleCreate(values as CreateUserDto)
    }
  }

  return (
    <DrawerForm<CreateUserDto & UpdateUserDto>
      title={currentRecord ? '编辑用户' : '创建用户'}
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
        label="用户名称"
        placeholder="请输入用户名称"
        rules={[
          { required: true, message: '请输入用户名称' },
          {
            type: 'string',
            min: 1,
            max: 20,
            message: '用户名不能超过20个字符',
          },
        ]}
      />

      <ProFormText
        name="code"
        label="用户编码"
        placeholder={`请输入用户编码`}
        rules={[
          { required: true, message: '请输入用户编码' },
          {
            type: 'string',
            min: 1,
            max: 300,
            message: '用户编码不能超过300个字符',
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
        label="用户状态"
        initialValue={Status.Enabled}
        options={STATUS_CONFIG}
        rules={[{ required: true, message: '请选择用户状态' }]}
      />

      <ProFormTextArea
        name="description"
        label="备注"
        rules={[
          {
            type: 'string',
            min: 0,
            max: 1000,
            message: '用户编码不能超过300个字符',
          },
        ]}
      />
    </DrawerForm>
  )
}
