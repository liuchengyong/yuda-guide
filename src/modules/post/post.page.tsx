'use client'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { App, Button, Space, Tag } from 'antd'
import React, { useRef, useState } from 'react'
import { request } from '../http/request'
import { DrawerEdit } from './components/drawer'
import { Post, SearchPostDto } from './post.model'
import { POST_STATUS_OPTIONS } from './post.constant'
import { DEFAULT_PAGINATION } from '@/constant'
export function PostPage() {
  const { modal, notification } = App.useApp()
  const [currentRecord, setCurrentRecord] = useState<Post | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const actionRef = useRef<ActionType>(null)
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])

  const columns: ProColumns<Post>[] = [
    {
      title: '岗位名称',
      dataIndex: 'name',
    },
    {
      title: '岗位编码',
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
        options: POST_STATUS_OPTIONS,
      },
      render: (value, record) => {
        const config = POST_STATUS_OPTIONS.find(
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
  const handleDelete = async (record: Post) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除岗位 "${record.name}(${record.code})" 吗？`,
      onOk: async () => {
        try {
          const response = await request.delete(`/api/post/${record.id}`)
          if (response.code === 0) {
            notification.success({
              message: '删除岗位成功',
            })
            actionRef.current?.reload()
          } else {
            notification.error({
              message: response.message || '删除岗位失败',
            })
          }
        } catch (error) {
          notification.error({
            message: '删除岗位失败',
          })
          console.error('删除岗位失败:', error)
        }
      },
    })
  }

  const tableRequest = async (params: any, sort: any, filter: any) => {
    const response = await request.get<SearchPostDto, Post>(
      '/api/post/list',
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
      <ProTable<Post>
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
            新建岗位
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
