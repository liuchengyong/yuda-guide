'use client'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import {
  ModalForm,
  ProFormSelect,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form'
import { App, Button, message, Modal, Space, Tag } from 'antd'
import React, { useRef, useState } from 'react'
import { request } from '../http/request'
import {
  CreatePermissionDto,
  Permission,
  SearchPermissionDto,
} from './permission.model'
import { PERMISSION_TYPE_OPTIONS } from './permission.constant'

export default function PermissionsPage() {
  const { modal } = App.useApp()
  const actionRef = useRef<ActionType>(null)
  const [currentRecord, setCurrentRecord] = useState<Permission | null>(null)
  const [openModal, setOpenModal] = useState(false)

  const columns: ProColumns<Permission>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'select',
      fieldProps: {
        options: PERMISSION_TYPE_OPTIONS,
      },
      render: (value, record) => {
        const config = PERMISSION_TYPE_OPTIONS.find(
          (option) => option.value === record.type,
        )
        return <Tag color={config?.color}>{value}</Tag>
      },
    },
    {
      title: '名称',
      dataIndex: 'name',
    },
    {
      title: '权限码',
      dataIndex: 'code',
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '更新时间',
      dataIndex: 'updatedTime',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '操作',
      dataIndex: 'action',
      search: false,
      render: (_, record) => {
        return (
          <Space>
            <Button
              type="link"
              size="small"
              onClick={() => {
                setOpenModal(true)
                setCurrentRecord(record)
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              danger
              size="small"
              onClick={() => handleDelete(record)}
            >
              删除
            </Button>
          </Space>
        )
      },
    },
  ]

  // 处理创建权限
  const handleCreate = async (values: CreatePermissionDto) => {
    try {
      const response = await request.post<CreatePermissionDto, Permission>(
        '/api/permissions',
        values,
      )
      if (response.code === 0) {
        message.success('创建权限成功')
        actionRef.current?.reload()
        return true
      } else {
        message.error(response.message || '创建权限失败')
        return false
      }
    } catch (error) {
      console.error('创建权限失败:', error)
      return false
    }
  }

  // 处理更新权限
  const handleUpdate = async (values: CreatePermissionDto) => {
    try {
      if (!currentRecord) {
        message.error('未找到要编辑的权限记录')
        return false
      }

      const response = await request.put<any, any>(
        `/api/permissions?id=${currentRecord.id}`,
        values,
      )

      if (response.code === 0) {
        message.success('更新权限成功')
        actionRef.current?.reload()
        return true
      } else {
        message.error(response.message || '更新权限失败')
        return false
      }
    } catch (error) {
      console.error('更新权限失败:', error)
      return false
    }
  }

  // 处理权限表单提交
  const handleFinish = async (values: CreatePermissionDto) => {
    if (currentRecord) {
      return handleUpdate(values)
    } else {
      return handleCreate(values)
    }
  }

  // 处理删除权限
  const handleDelete = async (record: Permission) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除权限 "${record.name}" 吗？`,
      onOk: async () => {
        try {
          const response = await request.request<any, any>({
            url: `/api/permissions?id=${record.id}`,
            method: 'DELETE',
          })

          if (response.code === 0) {
            message.success('删除权限成功')
            actionRef.current?.reload()
          } else {
            message.error(response.message || '删除权限失败')
          }
        } catch (error) {
          message.error('删除权限失败')
          console.error('删除权限失败:', error)
        }
      },
    })
  }

  // 表格数据请求函数
  const tableRequest = async (params: any, sort: any, filter: any) => {
    try {
      // 构建查询参数
      const queryParams = {
        page: params.current || 1,
        pageSize: params.pageSize || 10,
        ...params,
      }
      delete queryParams.current // 删除current参数，使用page代替

      // 发起请求获取权限列表数据
      const response = await request.get<SearchPermissionDto, Permission>(
        '/api/permissions',
        queryParams,
      )

      // 返回处理后的数据
      return {
        data: response.datas || [],
        success: true,
        total: response.total || 0,
      }
    } catch (error) {
      console.error('获取权限列表失败:', error)
      return {
        data: [],
        success: false,
        total: 0,
      }
    }
  }

  return (
    <PageContainer>
      <ProTable<Permission>
        columns={columns}
        rowKey="id"
        cardBordered
        actionRef={actionRef}
        request={tableRequest}
        pagination={{
          pageSize: 5,
          onChange: (page) => console.log(page),
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            onClick={() => {
              setOpenModal(true)
            }}
          >
            新建权限
          </Button>,
        ]}
        search={{
          defaultCollapsed: false,
        }}
      />

      {/* 编辑权限弹窗 */}
      <ModalForm<CreatePermissionDto>
        title={currentRecord ? '编辑权限' : '创建权限'}
        open={openModal}
        width={500}
        onOpenChange={(visible) => {
          setOpenModal(visible)
          if (!visible) {
            setCurrentRecord(null)
          }
        }}
        initialValues={currentRecord || undefined}
        autoFocusFirstInput
        modalProps={{
          destroyOnClose: true,
        }}
        onFinish={handleFinish}
      >
        <ProFormSelect
          name="type"
          label="权限类型"
          options={PERMISSION_TYPE_OPTIONS}
          rules={[{ required: true, message: '请选择权限类型' }]}
        />
        <ProFormText
          name="name"
          label="权限名称"
          placeholder="请输入权限名称"
          rules={[{ required: true, message: '请输入权限名称' }]}
        />
        <ProFormText
          name="code"
          label="权限码"
          placeholder="请输入权限码"
          rules={[{ required: true, message: '请输入权限码' }]}
        />
        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入权限描述"
          fieldProps={{
            rows: 4,
          }}
        />
      </ModalForm>
    </PageContainer>
  )
}
