'use client'

import { ActionType, ProColumns } from '@ant-design/pro-table'
import {
  DrawerForm,
  ProFormDigit,
  ProFormInstance,
  ProFormRadio,
  ProFormText,
  ProFormTreeSelect,
} from '@ant-design/pro-form'
import { App } from 'antd'
import React, { useEffect, useRef, useState } from 'react'
import { buildTree } from '@/lib/utils'
import { DataNode } from 'antd/lib/tree'
import { request } from '@/modules/http/request'
import { Dept, DeptStatus, DeptTreeVo } from '../dept.model'
import { DEPT_STATUS_OPTIONS } from '../dept.constant'

export interface DrawerEditProps {
  currentRecord: Dept | null
  open: boolean
  onOpenChange: (visible: boolean) => void
  actionRef: React.RefObject<ActionType | null>
}

export const DrawerEdit: React.FC<DrawerEditProps> = (props) => {
  const { currentRecord, open, onOpenChange, actionRef } = props
  const { notification } = App.useApp()
  const formRef = useRef<ProFormInstance<Partial<Dept>>>(null)

  useEffect(() => {
    if (open && currentRecord) {
      formRef.current?.setFieldsValue(currentRecord)
    }
  }, [open, currentRecord])
  // 处理创建菜单
  const handleCreate = async (values: Partial<Dept>) => {
    try {
      const response = await request.post<Partial<Dept>, Dept>(
        '/api/dept',
        values,
      )
      if (response.code === 0) {
        notification.success({
          message: '创建部门成功',
        })
        actionRef.current?.reload()
        return true
      } else {
        notification.error({
          message: response.message || '创建部门失败',
        })
        return false
      }
    } catch (error) {
      console.error('创建部门失败:', error)
      return false
    }
  }

  // 处理更新部门
  const handleUpdate = async (values: Partial<Dept>) => {
    try {
      const response = await request.put<Partial<Dept>, Dept>(
        `/api/dept/${currentRecord?.id}`,
        values,
      )

      if (response.code === 0) {
        notification.success({
          message: '更新部门成功',
        })
        actionRef.current?.reload()
        return true
      } else {
        notification.error({
          message: response.message || '更新部门失败',
        })
        return false
      }
    } catch (error) {
      console.error('更新部门失败:', error)
      return false
    }
  }

  // 处理部门表单提交
  const handleFinish = async (values: Partial<Dept>) => {
    if (currentRecord) {
      return handleUpdate(values)
    } else {
      return handleCreate(values)
    }
  }

  const treeSelectRequest = async () => {
    const response = await request.get<{}, DeptTreeVo>('/api/dept/simpleList')
    if (currentRecord) {
      response.datas = response.datas?.filter(
        (item) => item.id !== currentRecord?.id,
      )
    }
    const treeSelectDatas = buildTree<DeptTreeVo, DataNode>(
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
    <DrawerForm<Partial<Dept>>
      title={currentRecord ? '编辑部门' : '创建部门'}
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
        label="上级部门"
        rules={[{ required: true, message: '请选择父级部门' }]}
        request={treeSelectRequest}
      />

      <ProFormText
        name="name"
        label="部门名称"
        placeholder="请输入部门名称"
        rules={[
          { required: true, message: '请输入部门名称' },
          {
            type: 'string',
            min: 1,
            max: 20,
            message: '部门名不能超过20个字符',
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
        label="菜单状态"
        initialValue={DeptStatus.ENABLED}
        options={DEPT_STATUS_OPTIONS}
        rules={[{ required: true, message: '请选择菜单状态' }]}
      />

      <ProFormText
        name="email"
        label="邮箱"
        placeholder="请输入部门邮箱"
        rules={[
          {
            type: 'email',
            message: '邮箱格式不正确',
          },
          {
            type: 'string',
            min: 5,
            max: 100,
            message: '邮箱长度为5到100个字符',
          },
        ]}
      />

      <ProFormText
        name="mobile"
        label="手机号"
        placeholder="请输入部门邮箱"
        rules={[
          {
            pattern: /^1[3-9]\d{9}$/,
            message: '手机号格式不正确',
          },
        ]}
      />
    </DrawerForm>
  )
}
