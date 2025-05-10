'use client'
import { buildTree } from '@/lib/utils'
import { PlusOutlined, SwapOutlined } from '@ant-design/icons'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import { App, Button, Space, Tag } from 'antd'
import { useRef, useState } from 'react'
import { request } from '../http/request'
import { DrawerEdit } from './components/drawer'
import { Dept, DEPT_STATUS_OPTIONS, SearchDeptDto } from './dept.type'
export function DeptPage() {
  const { modal, notification } = App.useApp()
  const [currentRecord, setCurrentRecord] = useState<Dept | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const actionRef = useRef<ActionType>(null)
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])
  const pageInfoRef = useRef<{
    tableData: Dept[]
  }>({
    tableData: [],
  })

  const columns: ProColumns<Dept>[] = [
    {
      title: '部门名称',
      dataIndex: 'name',
    },
    {
      title: '排序',
      dataIndex: 'sort',
      search: false,
    },

    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: DEPT_STATUS_OPTIONS,
      },
      render: (value, record) => {
        const config = DEPT_STATUS_OPTIONS.find(
          (option) => option.value === record.status,
        )
        return <Tag color={config?.color}>{value}</Tag>
      },
    },
    {
      title: '创建时间',
      dataIndex: 'createdTime',
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
  const handleDelete = async (record: Dept) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除部门 "${record.name}" 吗？`,
      onOk: async () => {
        try {
          const response = await request.delete(`/api/dept/${record.id}`)
          if (response.code === 0) {
            notification.success({
              message: '删除部门成功',
            })
            actionRef.current?.reload()
          } else {
            notification.error({
              message: response.message || '删除部门失败',
            })
          }
        } catch (error) {
          notification.error({
            message: '删除部门失败',
          })
          console.error('删除部门失败:', error)
        }
      },
    })
  }

  const tableRequest = async (params: any, sort: any, filter: any) => {
    const response = await request.get<SearchDeptDto, Dept>(
      '/api/dept/list',
      params,
    )
    pageInfoRef.current.tableData = response.datas || []
    let datas: Dept[] = []
    let rootMenus: Dept[] = []
    response.datas?.forEach((item) => {
      if (!response.datas?.some((item1) => item.parentId == item1.id)) {
        rootMenus.push(item)
      }
    })
    rootMenus.forEach((item) => {
      const treeTableDatas = buildTree<Dept, Dept>(
        response.datas || [],
        item.id,
        (item) => {
          return item
        },
      )
      if (!item.parentId) {
        datas = datas.concat(treeTableDatas || [])
      } else {
        item.children = treeTableDatas.length > 0 ? treeTableDatas : undefined
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
      <ProTable<Dept>
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
            新建部门
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
