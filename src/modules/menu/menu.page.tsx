'use client'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { App, Button, Space, Tag } from 'antd'
import React, { useRef, useState } from 'react'
import { request } from '../http/request'
import { buildTree } from '@/lib/utils'
import { Menu, SearchMenuDto } from './menu.model'
import { MENU_STATUS_OPTIONS, MENU_TYPE_OPTIONS } from './menu.constant'
import { DrawerEdit } from './components/drawer'
import Icon from '@/components/Icon'
import { PlusOutlined, SwapOutlined } from '@ant-design/icons'
export function MenuPage() {
  const { modal, notification } = App.useApp()
  const [currentRecord, setCurrentRecord] = useState<Menu | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const actionRef = useRef<ActionType>(null)
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])
  const pageInfoRef = useRef<{
    tableData: Menu[]
  }>({
    tableData: [],
  })

  const columns: ProColumns<Menu>[] = [
    {
      title: '菜单名称',
      dataIndex: 'name',
    },
    {
      title: '类型',
      dataIndex: 'type',
      valueType: 'select',
      fieldProps: {
        options: MENU_TYPE_OPTIONS,
      },
      render: (value, record) => {
        const config = MENU_TYPE_OPTIONS.find(
          (option) => option.value === record.type,
        )
        return <Tag color={config?.color}>{value}</Tag>
      },
    },
    {
      title: '排序',
      dataIndex: 'sort',
      search: false,
    },
    {
      title: '权限码',
      dataIndex: 'code',
    },
    {
      title: '路径',
      dataIndex: 'path',
    },
    {
      title: '图标',
      dataIndex: 'icon',
      search: false,
      render: (value: any, record) => {
        return <Icon value={value}></Icon>
      },
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: MENU_STATUS_OPTIONS,
      },
      render: (value, record) => {
        const config = MENU_STATUS_OPTIONS.find(
          (option) => option.value === record.status,
        )
        return <Tag color={config?.color}>{value}</Tag>
      },
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
  const handleDelete = async (record: Menu) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除菜单 "${record.name}(${record.code})" 吗？`,
      onOk: async () => {
        try {
          const response = await request.delete(`/api/menu/${record.id}`)
          if (response.code === 0) {
            notification.success({
              message: '删除菜单成功',
            })
            actionRef.current?.reload()
          } else {
            notification.error({
              message: response.message || '删除菜单失败',
            })
          }
        } catch (error) {
          notification.error({
            message: '删除菜单失败',
          })
          console.error('删除菜单失败:', error)
        }
      },
    })
  }

  const tableRequest = async (params: any, sort: any, filter: any) => {
    const response = await request.get<SearchMenuDto, Menu>(
      '/api/menu/list',
      params,
    )
    pageInfoRef.current.tableData = response.datas || []
    let datas: Menu[] = []
    let rootMenus: Menu[] = []
    response.datas?.forEach((item) => {
      if (!response.datas?.some((item1) => item.parentId == item1.id)) {
        rootMenus.push(item)
      }
    })
    rootMenus.forEach((item) => {
      const treeTableDatas = buildTree<Menu, Menu>(
        response.datas || [],
        item.id,
        (item) => {
          return item
        },
      )
      if (!item.parentId) {
        datas = datas.concat(treeTableDatas || [])
      } else {
        item.children = treeTableDatas
        datas.push(item)
      }
    })

    return {
      data: datas,
      success: response.code === 0,
      total: response.total,
    }
  }

  return (
    <PageContainer>
      <ProTable<Menu>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={tableRequest}
        pagination={false}
        expandable={{
          defaultExpandAllRows: true,
          expandedRowKeys: expandedRowKeys,
          onExpandedRowsChange: (expandedRowKeys) => {
            setExpandedRowKeys(expandedRowKeys as string[])
          },
        }}
        toolBarRender={() => [
          <Button
            key="create"
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => {
              setCurrentRecord(null)
              setOpenModal(true)
            }}
          >
            新建菜单
          </Button>,
          <Button
            key="open"
            icon={<SwapOutlined rotate={90} />}
            onClick={() => {
              if (expandedRowKeys.length > 0) {
                setExpandedRowKeys([])
              } else {
                let rowKeys: string[] = []
                pageInfoRef.current.tableData.forEach((item) => {
                  if (
                    pageInfoRef.current.tableData.some(
                      (item1) => item1.parentId == item.id,
                    )
                  ) {
                    rowKeys.push(item.id)
                  }
                })
                setExpandedRowKeys(rowKeys)
              }
            }}
          >
            {expandedRowKeys.length > 0 ? '全部折叠' : '全部展开'}
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
