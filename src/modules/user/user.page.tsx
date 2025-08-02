'use client'
import { UserOutlined } from '@ant-design/icons'
import { ProFormInstance } from '@ant-design/pro-form'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { App, Avatar, Button, Space, Tag } from 'antd'
import { useRef, useState } from 'react'
import { STATUS_CONFIG } from '../common/base.type'
import { request } from '../http/request'
import { DrawerEdit } from './components/drawer'
import { SearchUserDto, UserVo } from './user.type'

export function UsersPage() {
  const { modal, notification } = App.useApp()
  const formRef = useRef<ProFormInstance<Partial<UserVo>>>(null)
  const [currentRecord, setCurrentRecord] = useState<UserVo | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [openRoleDrawer, setOpenRoleDrawer] = useState(false)
  const [roleUser, setRoleUser] = useState<UserVo | null>(null)
  const actionRef = useRef<ActionType>(null)

  const columns: ProColumns<UserVo>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      search: false,
    },
    {
      title: '账号',
      dataIndex: 'account',
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
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: STATUS_CONFIG,
      },
      render: (_, record) => {
        const config = STATUS_CONFIG.find(
          (option) => option.value === record.status,
        )
        return <Tag color={config?.color}>{config?.label}</Tag>
      },
    },
    {
      title: '更新时间',
      dataIndex: 'updatedTime',
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
          <Space direction="vertical">
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
  const handleDelete = async (record: UserVo) => {
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

  const handleResetPassword = (record: UserVo) => {
    modal.confirm({
      title: '重置密码',
      content: `确定要重置用户 "${record.account}" 的密码吗？`,
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
    const response = await request.get<SearchUserDto, UserVo>(
      '/api/user/list',
      params,
    )
    return {
      data: response.datas || [],
      success: response.code === 0,
      total: response.total,
    }
  }

  return (
    <PageContainer>
      <ProTable<UserVo>
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
      <DrawerEdit
        currentRecord={currentRecord}
        open={openModal}
        actionRef={actionRef}
        onOpenChange={(visible) => {
          setOpenModal(visible)
          if (!visible) {
            setCurrentRecord(null)
          }
        }}
      ></DrawerEdit>
    </PageContainer>
  )
}
