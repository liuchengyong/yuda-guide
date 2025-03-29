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
  CreateUserDto,
  SearchUserDto,
  UpdateUserDto,
  User,
  UserStatus,
} from './user.model'
import { USER_STATUS_OPTIONS } from './user.constant'

export default function UsersPage() {
  const { modal } = App.useApp()
  const actionRef = useRef<ActionType>(null)
  const [currentRecord, setCurrentRecord] = useState<User | null>(null)
  const [openModal, setOpenModal] = useState(false)

  const columns: ProColumns<User>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 220,
    },
    {
      title: '账号',
      dataIndex: 'account',
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: USER_STATUS_OPTIONS,
      },
      render: (_, record) => {
        const config = USER_STATUS_OPTIONS.find(
          (option) => option.value === record.status,
        )
        return <Tag color={config?.color}>{config?.label}</Tag>
      },
    },
    {
      title: '角色',
      dataIndex: 'roles',
      search: false,
      render: (_, record) => (
        <Space>
          {record.roles &&
            record.roles.map((roleRelation) => (
              <Tag key={roleRelation.role.id}>{roleRelation.role.name}</Tag>
            ))}
          {(!record.roles || record.roles.length === 0) && (
            <span style={{ color: '#999' }}>无角色</span>
          )}
        </Space>
      ),
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

  // 处理创建用户
  const handleCreate = async (values: CreateUserDto) => {
    try {
      const response = await request.post<CreateUserDto, User>(
        '/api/users',
        values,
      )
      if (response.code === 0) {
        message.success('创建用户成功')
        actionRef.current?.reload()
        return true
      } else {
        message.error(response.message || '创建用户失败')
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
      if (!currentRecord) {
        message.error('未找到要编辑的用户记录')
        return false
      }

      const response = await request.put<any, any>(
        `/api/users?id=${currentRecord.id}`,
        values,
      )

      if (response.code === 0) {
        message.success('更新用户成功')
        actionRef.current?.reload()
        return true
      } else {
        message.error(response.message || '更新用户失败')
        return false
      }
    } catch (error) {
      console.error('更新用户失败:', error)
      return false
    }
  }

  // 处理用户表单提交
  const handleFinish = async (values: CreateUserDto | UpdateUserDto) => {
    if (currentRecord) {
      return handleUpdate(values as UpdateUserDto)
    } else {
      return handleCreate(values as CreateUserDto)
    }
  }

  // 处理删除用户
  const handleDelete = async (record: User) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${record.account}" 吗？`,
      onOk: async () => {
        try {
          const response = await request.request<any, any>({
            url: `/api/users?id=${record.id}`,
            method: 'DELETE',
          })

          if (response.code === 0) {
            message.success('删除用户成功')
            actionRef.current?.reload()
          } else {
            message.error(response.message || '删除用户失败')
          }
        } catch (error) {
          message.error('删除用户失败')
          console.error('删除用户失败:', error)
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

      // 发起请求获取用户列表数据
      const response = await request.get<SearchUserDto, User>(
        '/api/users',
        queryParams,
      )

      // 返回处理后的数据
      return {
        data: response.datas || [],
        success: true,
        total: response.total || 0,
      }
    } catch (error) {
      console.error('获取用户列表失败:', error)
      return {
        data: [],
        success: false,
        total: 0,
      }
    }
  }

  // 获取角色列表
  const [roleOptions, setRoleOptions] = useState<
    { label: string; value: string }[]
  >([])

  React.useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await request.get('/api/roles', { pageSize: 100 })
        if (response.code === 0 && response.datas) {
          const options = response.datas.map((role: any) => ({
            label: role.name,
            value: role.id,
          }))
          setRoleOptions(options)
        }
      } catch (error) {
        console.error('获取角色列表失败:', error)
      }
    }

    fetchRoles()
  }, [])

  return (
    <PageContainer>
      <ProTable<User>
        columns={columns}
        rowKey="id"
        cardBordered
        actionRef={actionRef}
        request={tableRequest}
        pagination={{
          pageSize: 10,
        }}
        toolBarRender={() => [
          <Button
            type="primary"
            onClick={() => {
              setOpenModal(true)
              setCurrentRecord(null)
            }}
          >
            新建用户
          </Button>,
        ]}
        search={{
          defaultCollapsed: false,
        }}
      />

      {/* 编辑用户弹窗 */}
      <ModalForm<CreateUserDto | UpdateUserDto>
        title={currentRecord ? '编辑用户' : '创建用户'}
        open={openModal}
        width={500}
        onOpenChange={(visible) => {
          setOpenModal(visible)
          if (!visible) {
            setCurrentRecord(null)
          }
        }}
        initialValues={currentRecord || undefined}
        onFinish={handleFinish}
      >
        <ProFormText
          name="account"
          label="账号"
          rules={[{ required: !currentRecord, message: '请输入账号' }]}
          disabled={!!currentRecord}
        />
        <ProFormText
          name="email"
          label="邮箱"
          rules={[
            { required: !currentRecord, message: '请输入邮箱' },
            { type: 'email', message: '请输入有效的邮箱地址' },
          ]}
        />
        <ProFormText.Password
          name="password"
          label="密码"
          rules={[
            {
              required: !currentRecord,
              message: '请输入密码',
            },
            {
              min: 6,
              message: '密码长度不能少于6位',
            },
          ]}
          placeholder={currentRecord ? '不填写则不修改' : '请输入密码'}
        />
        <ProFormText name="avatar" label="头像URL" />
        <ProFormSelect
          name="status"
          label="状态"
          options={USER_STATUS_OPTIONS}
          rules={[{ required: true, message: '请选择状态' }]}
        />
        <ProFormSelect
          name="roles"
          label="角色"
          mode="multiple"
          options={roleOptions}
        />
      </ModalForm>
    </PageContainer>
  )
}
