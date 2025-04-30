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
import { Post, PostStatus } from '../post.model'
import { POST_STATUS_OPTIONS } from '../post.constant'

export interface DrawerEditProps {
  currentRecord: Post | null
  open: boolean
  onOpenChange: (visible: boolean) => void
  actionRef: React.RefObject<ActionType | null>
}

export const DrawerEdit: React.FC<DrawerEditProps> = (props) => {
  const { currentRecord, open, onOpenChange, actionRef } = props
  const { modal, notification } = App.useApp()
  const formRef = useRef<ProFormInstance<Partial<Post>>>(null)

  useEffect(() => {
    if (open && currentRecord) {
      formRef.current?.setFieldsValue(currentRecord)
    }
  }, [open, currentRecord])
  // 处理创建岗位
  const handleCreate = async (values: Partial<Post>) => {
    try {
      const response = await request.post<Partial<Post>, Post>(
        '/api/post',
        values,
      )
      if (response.code === 0) {
        notification.success({
          message: '创建岗位成功',
        })
        actionRef.current?.reload()
        return true
      } else {
        notification.error({
          message: response.message || '创建岗位失败',
        })
        return false
      }
    } catch (error) {
      console.error('创建岗位失败:', error)
      return false
    }
  }

  // 处理更新岗位
  const handleUpdate = async (values: Partial<Post>) => {
    try {
      const response = await request.put<Partial<Post>, Post>(
        `/api/post/${currentRecord?.id}`,
        values,
      )

      if (response.code === 0) {
        notification.success({
          message: '更新岗位成功',
        })
        actionRef.current?.reload()
        return true
      } else {
        notification.error({
          message: response.message || '更新岗位失败',
        })
        return false
      }
    } catch (error) {
      console.error('更新岗位失败:', error)
      return false
    }
  }

  // 处理岗位表单提交
  const handleFinish = async (values: Partial<Post>) => {
    if (currentRecord) {
      return handleUpdate(values)
    } else {
      return handleCreate(values)
    }
  }

  return (
    <DrawerForm<Partial<Post>>
      title={currentRecord ? '编辑岗位' : '创建岗位'}
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
        label="岗位名称"
        placeholder="请输入岗位名称"
        rules={[
          { required: true, message: '请输入岗位名称' },
          {
            type: 'string',
            min: 1,
            max: 20,
            message: '岗位名不能超过20个字符',
          },
        ]}
      />

      <ProFormText
        name="code"
        label="岗位编码"
        placeholder={`请输入岗位编码`}
        rules={[
          { required: true, message: '请输入岗位编码' },
          {
            type: 'string',
            min: 1,
            max: 300,
            message: '岗位编码不能超过300个字符',
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
        label="岗位状态"
        initialValue={PostStatus.OPEN}
        options={POST_STATUS_OPTIONS}
        rules={[{ required: true, message: '请选择岗位状态' }]}
      />

      <ProFormTextArea
        name="description"
        label="备注"
        rules={[
          {
            type: 'string',
            min: 0,
            max: 1000,
            message: '岗位编码不能超过300个字符',
          },
        ]}
      />
    </DrawerForm>
  )
}
