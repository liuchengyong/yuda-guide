'use client'
import { PageContainer } from '@ant-design/pro-layout'
import ProTable, { ActionType, ProColumns } from '@ant-design/pro-table'
import {
  DrawerForm,
  ProFormField,
  ProFormInstance,
  ProFormRadio,
  ProFormText,
  ProFormTextArea,
} from '@ant-design/pro-form'
import { App, Button, Space, Tag, Tree, TreeDataNode } from 'antd'
import React, { Key, useRef, useState } from 'react'
import { request } from '../http/request'
import {
  CreateRoleDto,
  GetRoleDto,
  Role,
  RoleStatus,
  UpdateRoleDto,
} from './role.model'
import { ROLE_STATUS_CONFIG } from './role.constant'
import { Permission } from '@prisma/client'
import { buildTree, dfs } from '@/lib/utils'
import { DataNode } from 'antd/es/tree'

export function RolesPage() {
  const { modal, notification } = App.useApp()
  const formRef = useRef<ProFormInstance<Partial<Role>>>(null)
  const [currentRecord, setCurrentRecord] = useState<Role | null>(null)
  const [openModal, setOpenModal] = useState(false)
  const actionRef = useRef<ActionType>(null)
  const [treeData, setTreeData] = useState<TreeDataNode[]>([])
  const [expandedKeys, setExpandedKeys] = useState<string[]>([])
  const columns: ProColumns<Role>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
    },
    {
      title: '角色名称',
      dataIndex: 'name',
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: ROLE_STATUS_CONFIG,
      },
      render: (_, record) => {
        const config = ROLE_STATUS_CONFIG.find(
          (option) => option.value === record.status,
        )
        return <Tag color={config?.color}>{config?.label}</Tag>
      },
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
      ellipsis: true,
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

  // 处理创建角色
  const handleCreate = async (values: Partial<Role>) => {
    try {
      const response = await request.post<Partial<Role>, Role>(
        '/api/roles',
        values,
      )
      if (response.code === 0) {
        notification.success({
          message: '创建角色成功',
        })
        actionRef.current?.reload()
        return true
      } else {
        notification.error({
          message: response.message || '创建角色失败',
        })
        return false
      }
    } catch (error) {
      console.error('创建角色失败:', error)
      return false
    }
  }

  // 处理更新角色
  const handleUpdate = async (values: UpdateRoleDto) => {
    try {
      if (!currentRecord) {
        notification.error({
          message: '未找到要编辑的角色记录',
        })
        return false
      }
      const response = await request.put<UpdateRoleDto, Role>(
        `/api/roles?id=${currentRecord.id}`,
        values,
      )

      if (response.code === 0) {
        notification.success({
          message: '更新角色成功',
        })
        actionRef.current?.reload()
        return true
      } else {
        notification.error({
          message: response.message || '更新角色失败',
        })
        return false
      }
    } catch (error) {
      console.error('更新角色失败:', error)
      return false
    }
  }

  // 处理角色表单提交
  const handleFinish = async (values: Partial<Role>) => {
    if (currentRecord) {
      return handleUpdate(values)
    } else {
      return handleCreate(values)
    }
  }

  // 处理删除角色
  const handleDelete = async (record: Role) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除角色 "${record.name}(${record.code})" 吗？`,
      onOk: async () => {
        try {
          const response = await request.request<any, any>({
            url: `/api/roles?id=${record.id}`,
            method: 'DELETE',
          })

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
    const response = await request.get<GetRoleDto, Role>('/api/roles', {
      ...params,
      page: params.current,
    })
    return {
      data: response.datas || [],
      success: response.code === 0,
      total: response.total,
    }
  }

  const onExpand = (expandedKeys: Key[]) => {
    setExpandedKeys(expandedKeys as string[])
  }

  return (
    <PageContainer>
      <ProTable<Role>
        rowKey="id"
        cardBordered
        actionRef={actionRef}
        columns={columns}
        request={tableRequest}
        search={{
          defaultCollapsed: false,
        }}
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
            新建角色
          </Button>,
        ]}
      />
      <DrawerForm<Partial<Role>>
        title={currentRecord ? '编辑角色' : '创建角色'}
        open={openModal}
        width={500}
        onOpenChange={async (visible) => {
          setOpenModal(visible)
          if (!visible) {
            setCurrentRecord(null)
          }
          if (visible && currentRecord) {
            let permissionIds: string[] = []
            currentRecord.rolePermissions.forEach((item) => {
              permissionIds.push(item.permissionId)
            })
            formRef.current?.setFieldsValue({
              ...currentRecord,
              permissionIds: permissionIds,
            })
          }
          if (visible) {
            const response = await request.get<{}, Permission>(
              '/api/permissions',
            )
            const expandedKeys: string[] = []
            const treeDatas = buildTree<Permission, TreeDataNode>(
              response.datas || [],
              null,
              (item) => {
                expandedKeys.push(item.id)
                return {
                  key: item.id,
                  title: item.name + '(' + item.code + ')',
                  children: [],
                }
              },
            )
            setTreeData(treeDatas)
            setExpandedKeys(expandedKeys)
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
          name="name"
          label="角色名称"
          placeholder="请输入角色名称"
          rules={[{ required: true, message: '请输入角色名称' }]}
        />

        <ProFormRadio.Group
          name="status"
          label="状态"
          initialValue={RoleStatus.Enabled}
          options={ROLE_STATUS_CONFIG}
          rules={[{ required: true, message: '请选择状态' }]}
        />

        <ProFormTextArea
          name="description"
          label="描述"
          placeholder="请输入角色描述"
          fieldProps={{
            rows: 4,
          }}
        />

        <ProFormField
          label="权限"
          name="permissionIds"
          valueType="text"
          renderFormItem={(_, { value, onChange }) => (
            <Tree
              checkable
              checkStrictly
              treeData={treeData}
              checkedKeys={value}
              onCheck={(checked: { checked: Key[] } | Key[]) => {
                if (Array.isArray(checked)) {
                  onChange?.(checked as string[])
                } else {
                  onChange?.(checked.checked as string[])
                }
              }}
              expandedKeys={expandedKeys}
              onExpand={onExpand}
            />
          )}
        />
      </DrawerForm>
    </PageContainer>
  )
}
