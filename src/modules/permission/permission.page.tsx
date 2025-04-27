'use client'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import {
  DrawerForm,
  ProFormDependency,
  ProFormDigit,
  ProFormInstance,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
  ProFormTreeSelect,
} from '@ant-design/pro-form'
import { App, Button, message, Space, Tag } from 'antd'
import React, { useRef, useState } from 'react'
import { request } from '../http/request'
import { Permission, PermissionType } from './permission.model'
import { PERMISSION_TYPE_OPTIONS } from './permission.constant'
import { buildTree } from '@/lib/utils'
import { DataNode } from 'antd/lib/tree'
export function PermissionsPage() {
  const { modal, notification } = App.useApp()
  const formRef = useRef<ProFormInstance<Partial<Permission>>>(null)
  const [currentRecord, setCurrentRecord] = useState<Permission | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const actionRef = useRef<ActionType>(null)
  const [expandedRowKeys, setExpandedRowKeys] = useState<string[]>([])

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
      title: '排序',
      dataIndex: 'sort',
    },
    {
      title: '路径',
      dataIndex: 'path',
    },
    {
      title: '图标',
      dataIndex: 'icon',
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
  // 处理创建权限
  const handleCreate = async (values: Partial<Permission>) => {
    try {
      const response = await request.post<Partial<Permission>, Permission>(
        '/api/permissions',
        values,
      )
      if (response.code === 0) {
        notification.success({
          message: '创建权限成功',
        })
        actionRef.current?.reload()
        return true
      } else {
        notification.error({
          message: response.message || '创建权限失败',
        })
        return false
      }
    } catch (error) {
      console.error('创建权限失败:', error)
      return false
    }
  }

  // 处理更新权限
  const handleUpdate = async (values: Partial<Permission>) => {
    try {
      if (!currentRecord) {
        notification.error({
          message: '未找到要编辑的权限记录',
        })
        return false
      }

      const response = await request.put<any, any>(
        `/api/permissions?id=${currentRecord.id}`,
        values,
      )

      if (response.code === 0) {
        notification.success({
          message: '更新权限成功',
        })
        actionRef.current?.reload()
        return true
      } else {
        notification.error({
          message: response.message || '更新权限失败',
        })
        return false
      }
    } catch (error) {
      console.error('更新权限失败:', error)
      return false
    }
  }

  // 处理权限表单提交
  const handleFinish = async (values: Partial<Permission>) => {
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
      content: `确定要删除权限 "${record.name}(${record.code})" 吗？`,
      onOk: async () => {
        try {
          const response = await request.request<any, any>({
            url: `/api/permissions?id=${record.id}`,
            method: 'DELETE',
          })

          if (response.code === 0) {
            notification.success({
              message: '删除权限成功',
            })
            actionRef.current?.reload()
          } else {
            notification.error({
              message: response.message || '删除权限失败',
            })
          }
        } catch (error) {
          notification.error({
            message: '删除权限失败',
          })
          console.error('删除权限失败:', error)
        }
      },
    })
  }

  const tableRequest = async (params: any, sort: any, filter: any) => {
    const response = await request.get<{}, Permission>('/api/permissions')
    let rootId = null
    let expandedRowKeys: string[] = []
    response.datas = response.datas?.filter((item) => {
      if (item.type === PermissionType.System) {
        rootId = item.id
        return false
      }
      return true
    })
    const treeTableDatas = buildTree<Permission, Permission>(
      response.datas || [],
      rootId,
      (item) => {
        expandedRowKeys.push(item.id)
        return item
      },
    )
    setExpandedRowKeys(expandedRowKeys)
    return {
      data: treeTableDatas,
      success: response.code === 0,
      total: response.total,
    }
  }

  const treeSelectRequest = async () => {
    const response = await request.get<{}, Permission>('/api/permissions')
    if (currentRecord) {
      response.datas = response.datas?.filter(
        (item) => item.id !== currentRecord?.id,
      )
    }
    const treeSelectDatas = buildTree<Permission, DataNode>(
      response.datas || [],
      null,
      (item) => {
        return {
          key: item.id,
          value: item.id,
          label: item.name,
          children: [],
        }
      },
    )
    return treeSelectDatas
  }

  return (
    <PageContainer>
      <ProTable<Permission>
        rowKey="id"
        actionRef={actionRef}
        columns={columns}
        request={tableRequest}
        pagination={false}
        search={false}
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
            onClick={() => {
              setOpenModal(true)
              setCurrentRecord(null)
            }}
          >
            新建权限
          </Button>,
        ]}
      />
      <DrawerForm<Partial<Permission>>
        title={currentRecord ? '编辑权限' : '创建权限'}
        open={openModal}
        width={500}
        onOpenChange={(visible) => {
          setOpenModal(visible)
          if (!visible) {
            setCurrentRecord(null)
          }
          if (visible) {
            if (currentRecord) {
              formRef.current?.setFieldsValue(currentRecord)
            }
          }
        }}
        formRef={formRef}
        autoFocusFirstInput
        drawerProps={{
          destroyOnClose: true,
        }}
        onFinish={handleFinish}
      >
        <ProFormRadio.Group
          name="type"
          label="权限类型"
          initialValue={PermissionType.Module}
          options={PERMISSION_TYPE_OPTIONS}
          rules={[{ required: true, message: '请选择权限类型' }]}
        />

        <ProFormTreeSelect
          name="parentId"
          label="父级权限"
          rules={[{ required: true, message: '请选择父级权限' }]}
          request={treeSelectRequest}
        />

        <ProFormText
          name="name"
          label="权限名称"
          placeholder="请输入权限名称"
          rules={[{ required: true, message: '请输入权限名称' }]}
        />
        <ProFormDependency name={['type']}>
          {({ type }) => {
            const config = PERMISSION_TYPE_OPTIONS.find(
              (option) => option.value === type,
            )
            return (
              <ProFormText
                name="code"
                label="权限码"
                placeholder={`请输入权限码,必须以${config?.startWith}开头`}
                rules={[
                  { required: true, message: '请输入权限码' },
                  {
                    pattern: new RegExp(`^${config?.startWith}.*`),
                    message: `请输入以${config?.startWith}开头的权限码`,
                  },
                ]}
              />
            )
          }}
        </ProFormDependency>

        <ProFormDigit
          name="sort"
          label="排序"
          placeholder="请输入排序"
          min={1}
          max={200}
          fieldProps={{
            precision: 0,
          }}
          rules={[{ required: true, message: '请输入排序' }]}
        />

        <ProFormText name="path" label="路径" placeholder="请输入路径" />

        <ProFormText name="icon" label="图标" placeholder="请输入图标" />

        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入权限描述"
          fieldProps={{
            rows: 4,
          }}
        />
      </DrawerForm>
    </PageContainer>
  )
}
