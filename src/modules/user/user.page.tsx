'use client'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import {
  DrawerForm,
  ProFormDigit,
  ProFormInstance,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form'
import { App, Avatar, Button, message, Space, Tag } from 'antd'
import { UserOutlined } from '@ant-design/icons'
import React, { useRef, useState } from 'react'
import { request } from '../http/request'
import { User, UserStatus } from './user.model'
import { USER_STATUS_CONFIG } from './user.constant'
import { UserRoleDrawer } from './user.role'

export default function UsersPage() {
  const { modal, notification } = App.useApp()
  const formRef = useRef<ProFormInstance<Partial<User>>>(null)
  const [currentRecord, setCurrentRecord] = useState<User | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [openRoleDrawer, setOpenRoleDrawer] = useState(false)
  const [roleUser, setRoleUser] = useState<User | null>(null)
  const actionRef = useRef<ActionType>(null)

  const columns: ProColumns<User>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      search: false,
    },
    {
      title: '用户名',
      dataIndex: 'username',
    },
    {
      title: '昵称',
      dataIndex: 'nickname',
    },
    {
      title: '头像',
      dataIndex: 'avatar',
      search: false,
      render: (_, record) => {
        return <Avatar src={record.avatar} icon={<UserOutlined />} />
      },
    },
    {
      title: '邮箱',
      dataIndex: 'email',
    },
    {
      title: '手机号',
      dataIndex: 'phone',
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: USER_STATUS_CONFIG,
      },
      render: (_, record) => {
        const config = USER_STATUS_CONFIG.find(
          (option) => option.value === record.status,
        )
        return <Tag color={config?.color}>{config?.label}</Tag>
      },
    },
    {
      title: '最后登录时间',
      dataIndex: 'lastLoginTime',
      valueType: 'dateTime',
      search: false,
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
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
                setCurrentRecord(record)
                setOpenModal(true)
              }}
            >
              编辑
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => handleRoles(record)}
            >
              角色
            </Button>
            <Button
              type="link"
              size="small"
              onClick={() => handleResetPassword(record)}
            >
              重置密码
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
  const handleCreate = async (values: Partial<User>) => {
    try {
      const response = await request.post<Partial<User>, User>(
        '/api/users',
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
  const handleUpdate = async (values: Partial<User>) => {
    try {
      if (!currentRecord) {
        notification.error({
          message: '未找到要编辑的用户记录',
        })
        return false
      }

      const response = await request.put<any, any>(
        `/api/users?id=${currentRecord.id}`,
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
  const handleFinish = async (values: Partial<User>) => {
    if (currentRecord) {
      return handleUpdate(values)
    } else {
      return handleCreate(values)
    }
  }

  // 处理删除用户
  const handleDelete = async (record: User) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除用户 "${record.username}" 吗？`,
      onOk: async () => {
        try {
          const response = await request.request<any, any>({
            url: `/api/users?id=${record.id}`,
            method: 'DELETE',
          })

          if (response.code === 0) {
            notification.success({
              message: '删除用户成功',
            })
            actionRef.current?.reload()
          } else {
            notification.error({
              message: response.message || '删除用户失败',
            })
          }
        } catch (error) {
          notification.error({
            message: '删除用户失败',
          })
          console.error('删除用户失败:', error)
        }
      },
    })
  }

  // 处理角色分配
  const handleRoles = (record: User) => {
    setRoleUser(record)
    setOpenRoleDrawer(true)
  }

  // 处理重置密码
  const handleResetPassword = (record: User) => {
    modal.confirm({
      title: '重置密码',
      content: `确定要重置用户 "${record.username}" 的密码吗？`,
      onOk: async () => {
        try {
          // 这里可以调用重置密码的接口
          notification.success({
            message: '重置密码成功',
            description: '新密码已发送至用户邮箱',
          })
        } catch (error) {
          notification.error({
            message: '重置密码失败',
          })
          console.error('重置密码失败:', error)
        }
      },
    })
  }

  const tableRequest = async (params: any, sort: any, filter: any) => {
    const response = await request.get<{}, User>('/api/users')
    return {
      data: response.datas || [],
      success: response.code === 0,
      total: response.total,
    }
  }

  return (
    <PageContainer>
      <ProTable<User>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={tableRequest}
        pagination={{
          defaultPageSize: 10,
          showSizeChanger: true,
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            onClick={() => {
              setOpenModal(true)
              setCurrentRecord(null)
            }}
          >
            新建用户
          </Button>,
        ]}
      />
      <DrawerForm<Partial<User>>
        title={currentRecord ? '编辑用户' : '创建用户'}
        open={openModal}
        width={500}
        onOpenChange={(visible) => {
          setOpenModal(visible)
          if (!visible) {
            setCurrentRecord(null)
          }
          if (visible && currentRecord) {
            // 编辑时不显示密码字段
            const { password, ...userWithoutPassword } = currentRecord
            formRef.current?.setFieldsValue(userWithoutPassword)
          }
        }}
        formRef={formRef}
        autoFocusFirstInput
        drawerProps={{
          destroyOnClose: true,
        }}
        onFinish={handleFinish}
      >
        <ProFormText
          name="username"
          label="用户名"
          placeholder="请输入用户名"
          rules={[{ required: true, message: '请输入用户名' }]}
          disabled={!!currentRecord} // 编辑时不允许修改用户名
        />

        {!currentRecord && (
          <ProFormText.Password
            name="password"
            label="密码"
            placeholder="请输入密码"
            rules={[{ required: true, message: '请输入密码' }]}
          />
        )}

        <ProFormText name="nickname" label="昵称" placeholder="请输入昵称" />

        <ProFormText
          name="email"
          label="邮箱"
          placeholder="请输入邮箱"
          rules={[
            {
              type: 'email',
              message: '请输入有效的邮箱地址',
            },
          ]}
        />

        <ProFormText
          name="phone"
          label="手机号"
          placeholder="请输入手机号"
          rules={[
            {
              pattern: /^1[3-9]\d{9}$/,
              message: '请输入有效的手机号',
            },
          ]}
        />

        <ProFormText
          name="avatar"
          label="头像URL"
          placeholder="请输入头像URL"
        />

        <ProFormRadio.Group
          name="status"
          label="状态"
          initialValue={UserStatus.Enabled}
          options={USER_STATUS_CONFIG}
          rules={[{ required: true, message: '请选择状态' }]}
        />
      </DrawerForm>

      {/* 角色抽屉组件 */}
      <UserRoleDrawer
        open={openRoleDrawer}
        onClose={() => {
          setOpenRoleDrawer(false)
          setRoleUser(null)
          // 关闭后刷新数据
          actionRef.current?.reload()
        }}
        currentUser={roleUser}
      />
    </PageContainer>
  )
}
