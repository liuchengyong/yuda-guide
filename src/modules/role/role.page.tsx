'use client'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { App, Button, Space, Tag } from 'antd'
import React, { useRef, useState } from 'react'
import { request } from '../http/request'
import { DrawerEdit } from './components/drawer'
import { DEFAULT_PAGINATION } from '@/constant'
import { MenuDrawerEdit } from './components/menuDrawer'
import { Role } from '@prisma/client'
import { ROLE_STATUS_CONFIG, SearchRoleDto } from './role.type'
export function RolePage() {
  const { modal, notification } = App.useApp()
  const [currentRecord, setCurrentRecord] = useState<Role | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const [openMenuModal, setOpenMenuModal] = useState(false)
  const actionRef = useRef<ActionType>(null)

  const columns: ProColumns<Role>[] = [
    {
      title: '角色名称',
      dataIndex: 'name',
    },
    {
      title: '角色编码',
      dataIndex: 'code',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      search: false,
    },
    {
      title: '备注',
      dataIndex: 'description',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: ROLE_STATUS_CONFIG,
      },
      render: (value, record) => {
        const config = ROLE_STATUS_CONFIG.find(
          (option) => option.value === record.status,
        )
        return <Tag color={config?.color}>{value}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
      search: false,
      valueType: 'dateTime',
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
              onClick={() => {
                setCurrentRecord(record)
                setOpenMenuModal(true)
              }}
            >
              菜单权限
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

  // 处理删除权限
  const handleDelete = async (record: Role) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除角色 "${record.name}(${record.code})" 吗？`,
      onOk: async () => {
        try {
          const response = await request.delete(`/api/role/${record.id}`)
          if (response.code === 0) {
            notification.success({
              message: '删除角色成功',
            })
            actionRef.current?.reload()
          } else {
            notification.error({
              message: response.message || '删除角色失败',
            })
          }
        } catch (error) {
          notification.error({
            message: '删除角色失败',
          })
          console.error('删除角色失败:', error)
        }
      },
    })
  }

  const tableRequest = async (params: any, sort: any, filter: any) => {
    const response = await request.get<SearchRoleDto, Role>(
      '/api/role/list',
      params,
    )
    return {
      data: response.datas,
      success: response.code === 0,
      total: response.total,
    }
  }

  return (
    <PageContainer>
      <ProTable<Role>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={tableRequest}
        pagination={{
          ...DEFAULT_PAGINATION,
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
            新建角色
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
      <MenuDrawerEdit
        currentRecord={currentRecord}
        open={openMenuModal}
        actionRef={actionRef}
        onOpenChange={(visible) => {
          setOpenMenuModal(visible)
          if (!visible) {
            setCurrentRecord(null)
          }
        }}
      ></MenuDrawerEdit>
    </PageContainer>
  )
}
