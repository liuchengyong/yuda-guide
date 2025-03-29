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
  CreateRoleDto,
  Role,
  RoleStatus,
  SearchRoleDto,
  UpdateRoleDto,
} from './role.model'
import { ROLE_STATUS_OPTIONS } from './role.constant'
import { PermissionType } from '../permission/permission.model'
import { PERMISSION_TYPE_OPTIONS } from '../permission/permission.constant'

export default function RolesPage() {
  const { modal } = App.useApp()
  const actionRef = useRef<ActionType>(null)
  const [currentRecord, setCurrentRecord] = useState<Role | null>(null)
  const [openModal, setOpenModal] = useState(false)

  const columns: ProColumns<Role>[] = [
    {
      title: 'ID',
      dataIndex: 'id',
      width: 220,
    },
    {
      title: '角色名称',
      dataIndex: 'name',
    },
    {
      title: '描述',
      dataIndex: 'description',
      search: false,
    },
    {
      title: '状态',
      dataIndex: 'status',
      valueType: 'select',
      fieldProps: {
        options: ROLE_STATUS_OPTIONS,
      },
      render: (_, record) => {
        const config = ROLE_STATUS_OPTIONS.find(
          (option) => option.value === record.status,
        )
        return <Tag color={config?.color}>{config?.label}</Tag>
      },
    },
    {
      title: '权限数量',
      dataIndex: 'permissions',
      search: false,
      render: (_, record) => {
        return record.permissions ? record.permissions.length : 0
      },
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

  // 处理创建角色
  const handleCreate = async (values: CreateRoleDto) => {
    try {
      const response = await request.post<CreateRoleDto, Role>(
        '/api/roles',
        values,
      )
      if (response.code === 0) {
        message.success('创建角色成功')
        actionRef.current?.reload()
        return true
      } else {
        message.error(response.message || '创建角色失败')
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
        message.error('未找到要编辑的角色记录')
        return false
      }

      const response = await request.put<any, any>(
        `/api/roles?id=${currentRecord.id}`,
        values,
      )

      if (response.code === 0) {
        message.success('更新角色成功')
        actionRef.current?.reload()
        return true
      } else {
        message.error(response.message || '更新角色失败')
        return false
      }
    } catch (error) {
      console.error('更新角色失败:', error)
      return false
    }
  }

  // 处理角色表单提交
  const handleFinish = async (values: CreateRoleDto | UpdateRoleDto) => {
    if (currentRecord) {
      return handleUpdate(values as UpdateRoleDto)
    } else {
      return handleCreate(values as CreateRoleDto)
    }
  }

  // 处理删除角色
  const handleDelete = async (record: Role) => {
    modal.confirm({
      title: '确认删除',
      content: `确定要删除角色 "${record.name}" 吗？删除后关联的用户将失去该角色的权限。`,
      onOk: async () => {
        try {
          const response = await request.request<any, any>({
            url: `/api/roles?id=${record.id}`,
            method: 'DELETE',
          })

          if (response.code === 0) {
            message.success('删除角色成功')
            actionRef.current?.reload()
          } else {
            message.error(response.message || '删除角色失败')
          }
        } catch (error) {
          message.error('删除角色失败')
          console.error('删除角色失败:', error)
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

      // 发起请求获取角色列表数据
      const response = await request.get<SearchRoleDto, Role>(
        '/api/roles',
        queryParams,
      )

      // 返回处理后的数据
      return {
        data: response.datas || [],
        success: true,
        total: response.total || 0,
      }
    } catch (error) {
      console.error('获取角色列表失败:', error)
      return {
        data: [],
        success: false,
        total: 0,
      }
    }
  }

  // 获取权限列表
  const [permissionOptions, setPermissionOptions] = useState<
    { label: string; value: string; type: PermissionType }[]
  >([])

  React.useEffect(() => {
    const fetchPermissions = async () => {
      try {
        const response = await request.get('/api/permissions', {
          pageSize: 200,
        })
        if (response.code === 0 && response.datas) {
          const options = response.datas.map((permission: any) => ({
            label: `${permission.name} (${permission.code})`,
            value: permission.id,
            type: permission.type,
          }))
          setPermissionOptions(options)
        }
      } catch (error) {
        console.error('获取权限列表失败:', error)
      }
    }

    fetchPermissions()
  }, [])

  // 生成带分组的权限选项
  const groupedPermissionOptions = React.useMemo(() => {
    // 按权限类型分组
    const groups = PERMISSION_TYPE_OPTIONS.map((typeConfig) => {
      return {
        label: typeConfig.label,
        options: permissionOptions
          .filter((p) => p.type === typeConfig.value)
          .map((p) => ({ label: p.label, value: p.value })),
      }
    }).filter((group) => group.options.length > 0)

    return groups
  }, [permissionOptions])

  return (
    <PageContainer>
      <ProTable<Role>
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
            新建角色
          </Button>,
        ]}
        search={{
          defaultCollapsed: false,
        }}
      />

      {/* 编辑角色弹窗 */}
      <ModalForm<CreateRoleDto | UpdateRoleDto>
        title={currentRecord ? '编辑角色' : '创建角色'}
        open={openModal}
        width={600}
        onOpenChange={(visible) => {
          setOpenModal(visible)
          if (!visible) {
            setCurrentRecord(null)
          }
        }}
        initialValues={
          currentRecord
            ? {
                ...currentRecord,
                permissions: currentRecord.permissions?.map(
                  (p) => p.permission?.id,
                ),
              }
            : undefined
        }
        onFinish={handleFinish}
      >
        <ProFormText
          name="name"
          label="角色名称"
          rules={[{ required: true, message: '请输入角色名称' }]}
        />
        <ProFormTextArea
          name="description"
          label="角色描述"
          placeholder="请输入角色描述"
        />
        <ProFormSelect
          name="status"
          label="状态"
          options={ROLE_STATUS_OPTIONS}
          rules={[{ required: true, message: '请选择状态' }]}
        />
        <ProFormSelect
          name="permissions"
          label="权限"
          mode="multiple"
          options={groupedPermissionOptions}
          fieldProps={{
            optionFilterProp: 'label',
            showSearch: true,
          }}
        />
      </ModalForm>
    </PageContainer>
  )
}
