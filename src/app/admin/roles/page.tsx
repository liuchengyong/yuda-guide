'use client'

import React, { useState, useEffect } from 'react'
import {
  Table,
  Card,
  Button,
  Space,
  Input,
  Popconfirm,
  message,
  Modal,
  Form,
  Select,
  Descriptions,
  Tag,
} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { RoleService } from '@/services/role.service'
import { PermissionService } from '@/services/permission.service'
import type { Role } from '@/types/role'
import type { Permission } from '@/types/permission'

const { Column } = Table

export default function RolesPage() {
  // 状态定义
  const [roles, setRoles] = useState<Role[]>([])
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [editingRole, setEditingRole] = useState<Role | null>(null)
  const [viewingRole, setViewingRole] = useState<Role | null>(null)
  const [form] = Form.useForm()

  // 服务实例
  const roleService = new RoleService()
  const permissionService = new PermissionService()

  // 加载角色数据
  const loadRoles = async (page = current, size = pageSize, search = searchText) => {
    setLoading(true)
    try {
      const result = await roleService.findAll({
        skip: (page - 1) * size,
        take: size,
        where: search
          ? {
              OR: [
                { name: { contains: search } },
                { description: { contains: search } },
              ],
            }
          : undefined,
        include: {
          permissions: {
            include: {
              permission: true,
            },
          },
        },
      })

      setRoles(result.data)
      setTotal(result.total)
    } catch (error) {
      console.error('加载角色失败', error)
      message.error('加载角色失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载权限数据
  const loadPermissions = async () => {
    try {
      const result = await permissionService.findAll()
      setPermissions(result.data)
    } catch (error) {
      console.error('加载权限失败', error)
      message.error('加载权限失败')
    }
  }

  // 初始加载
  useEffect(() => {
    loadRoles()
    loadPermissions()
  }, [])

  // 处理搜索
  const handleSearch = () => {
    setCurrent(1) // 重置到第一页
    loadRoles(1, pageSize, searchText)
  }

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setCurrent(pagination.current)
    setPageSize(pagination.pageSize)
    loadRoles(pagination.current, pagination.pageSize, searchText)
  }

  // 处理删除角色
  const handleDeleteRole = async (id: string) => {
    try {
      await roleService.delete(id)
      message.success('删除角色成功')
      loadRoles() // 重新加载数据
    } catch (error) {
      console.error('删除角色失败', error)
      message.error('删除角色失败')
    }
  }

  // 打开编辑/创建模态框
  const showModal = (role?: Role) => {
    setEditingRole(role || null)
    form.resetFields()
    if (role) {
      // 编辑模式，设置表单初始值
      form.setFieldsValue({
        ...role,
        permissionIds: role.permissions?.map((p) => p.permission.id) || [],
      })
    }
    setIsModalVisible(true)
  }

  // 查看角色详情
  const viewRoleDetails = (role: Role) => {
    setViewingRole(role)
    setIsViewModalVisible(true)
  }

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingRole) {
        // 更新角色
        await roleService.update(editingRole.id, {
          ...values,
          permissions: values.permissionIds?.map((id: string) => ({ permissionId: id })),
        })
        message.success('更新角色成功')
      } else {
        // 创建角色
        await roleService.create({
          ...values,
          permissions: values.permissionIds?.map((id: string) => ({ permissionId: id })),
        })
        message.success('创建角色成功')
      }
      setIsModalVisible(false)
      loadRoles() // 重新加载数据
    } catch (error) {
      console.error('保存角色失败', error)
      message.error('保存角色失败')
    }
  }

  // 处理模态框取消
  const handleModalCancel = () => {
    setIsModalVisible(false)
  }

  // 处理查看模态框取消
  const handleViewModalCancel = () => {
    setIsViewModalVisible(false)
  }

  return (
    <Card
      title="角色管理"
      extra={
        <Space>
          <Input
            placeholder="搜索角色名称或描述"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            onPressEnter={handleSearch}
            style={{ width: 250 }}
            suffix={
              <Button
                type="text"
                icon={<SearchOutlined />}
                onClick={handleSearch}
              />
            }
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => showModal()}
          >
            新增角色
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={roles}
        rowKey="id"
        loading={loading}
        pagination={{
          current,
          pageSize,
          total,
          showSizeChanger: true,
          showQuickJumper: true,
          showTotal: (total) => `共 ${total} 条记录`,
        }}
        onChange={handleTableChange}
      >
        <Column title="角色名称" dataIndex="name" key="name" />
        <Column title="描述" dataIndex="description" key="description" />
        <Column
          title="权限"
          key="permissions"
          render={(_, record: any) => (
            <Space size={[0, 8]} wrap>
              {record.permissions?.map((p: any) => (
                <Tag color="blue" key={p.permission.id}>
                  {p.permission.name}
                </Tag>
              ))}
            </Space>
          )}
        />
        <Column
          title="操作"
          key="action"
          render={(_, record: Role) => (
            <Space size="middle">
              <Button type="link" onClick={() => viewRoleDetails(record)}>
                查看
              </Button>
              <Button type="link" onClick={() => showModal(record)}>
                编辑
              </Button>
              <Popconfirm
                title="确定要删除这个角色吗？"
                onConfirm={() => handleDeleteRole(record.id)}
                okText="确定"
                cancelText="取消"
              >
                <Button type="link" danger>
                  删除
                </Button>
              </Popconfirm>
            </Space>
          )}
        />
      </Table>

      {/* 编辑/创建角色模态框 */}
      <Modal
        title={editingRole ? '编辑角色' : '新增角色'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="角色名称"
            rules={[{ required: true, message: '请输入角色名称' }]}
          >
            <Input placeholder="请输入角色名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="角色描述"
            rules={[{ required: true, message: '请输入角色描述' }]}
          >
            <Input.TextArea placeholder="请输入角色描述" rows={3} />
          </Form.Item>
          <Form.Item
            name="permissionIds"
            label="权限"
            rules={[{ required: true, message: '请选择至少一个权限' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择权限"
              style={{ width: '100%' }}
              options={permissions.map((p) => ({
                label: p.name,
                value: p.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看角色详情模态框 */}
      <Modal
        title="角色详情"
        open={isViewModalVisible}
        onCancel={handleViewModalCancel}
        footer={[
          <Button key="close" onClick={handleViewModalCancel}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {viewingRole && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="角色名称">{viewingRole.name}</Descriptions.Item>
            <Descriptions.Item label="角色描述">
              {viewingRole.description}
            </Descriptions.Item>
            <Descriptions.Item label="权限">
              <Space size={[0, 8]} wrap>
                {viewingRole.permissions?.map((p: any) => (
                  <Tag color="blue" key={p.permission.id}>
                    {p.permission.name}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(viewingRole.createdTime).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(viewingRole.updatedTime).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )