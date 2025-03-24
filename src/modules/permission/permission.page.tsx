'use client'
import { PageContainer } from '@ant-design/pro-layout'
import { ActionType } from '@ant-design/pro-table'
import { Button } from 'antd'
import React, { useRef } from 'react'
import { request } from '../http/request'
import {
  CreatePermissionDto,
  CreatePermissionVo,
  PermissionType,
} from './permission.model'

export default function PermissionsPage() {
  const actionRef = useRef<ActionType | null>(null)

  const create = () => {
    request.request<CreatePermissionDto, CreatePermissionVo>({
      method: 'POST',
      url: '/api/permissions',
      data: {
        type: PermissionType.Module,
        name: '用户模块',
        code: 'user:',
        description: '用户模块权限',
      },
    })
  }

  return (
    <PageContainer
      header={{
        title: '权限管理',
        breadcrumb: {
          routes: [{ path: '', breadcrumbName: '权限管理' }],
        },
      }}
    >
      <Button onClick={create}>创建</Button>
    </PageContainer>
  )
}
