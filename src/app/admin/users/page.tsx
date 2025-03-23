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
  Avatar,
} from 'antd'
import { PlusOutlined, SearchOutlined, UserOutlined } from '@ant-design/icons'
import { UserService } from '@/services/user.service'
import { RoleService } from '@/services/role.service'
import type { User } from '@/types/user'
import type { Role } from '@/types/role'

const { Column } = Table

export default function UsersPage() {
  // 状态定义
  const [users, setUsers] = useState<User[]>([])
  const [roles, setRoles] = useState<Role[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [editingUser, setEditingUser] = useState<User | null>(null)
  const [viewingUser, setViewingUser] = useState<User | null>(null)
  const [form] = Form.useForm()

  // 服务实例
  const userService = new UserService()
  const roleService = new RoleService()

  // 加载用户数据
  const loadUsers = async (page = current, size = pageSize, search = searchText) => {
    setLoading(true)
    try {
      const result = await userService.findAll({
        skip: (page - 1) * size,
        take: size,
        where: search
          ? {
              OR: [
                { account: { contains: search } },
                { email: { contains: search } },
              ],
            }
          : undefined,
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      })

      setUsers(result.data)
      setTotal(result.total)
    } catch (error) {
      console.error('加载用户失败', error)
      message.error('加载用户失败')
    } finally {
      setLoading(false)
    }
  }

  // 加载角色数据
  const loadRoles = async () => {
    try {
      const result = await roleService.findAll()
      setRoles(result.data)
    } catch (error) {
      console.error('加载角色失败', error)
      message.error('加载角色失败')
    }
  }

  // 初始加载
  useEffect(() => {
    loadUsers()
    loadRoles()
  }, [])

  // 处理搜索
  const handleSearch = () => {
    setCurrent(1) // 重置到第一页
    loadUsers(1, pageSize, searchText)
  }

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setCurrent(pagination.current)
    setPageSize(pagination.pageSize)
    loadUsers(pagination.current, pagination.pageSize, searchText)
  }

  // 处理删除用户
  const handleDeleteUser = async (id: string) => {
    try {
      await userService.delete(id)
      message.success('删除用户成功')
      loadUsers() // 重新加载数据
    } catch (error) {
      console.error('删除用户失败', error)
      message.error('删除用户失败')
    }
  }

  // 打开编辑/创建模态框
  const showModal = (user?: User) => {
    setEditingUser(user || null)
    form.resetFields()
    if (user) {
      // 编辑模式，设置表单初始值
      form.setFieldsValue({
        ...user,
        roleIds: user.roles?.map((r) => r.role.id) || [],
      })
    }
    setIsModalVisible(true)
  }

  // 查看用户详情
  const viewUserDetails = (user: User) => {
    setViewingUser(user)
    setIsViewModalVisible(true)
  }

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingUser) {
        // 更新用户
        await userService.update(editingUser.id, {
          ...values,
          roles: values.roleIds?.map((id: string) => ({ roleId: id })),
        })
        message.success('更新用户成功')
      } else {
        // 创建用户
        await userService.create({
          ...values,
          roles: values.roleIds?.map((id: string) => ({ roleId: id })),
        })
        message.success('创建用户成功')
      }
      setIsModalVisible(false)
      loadUsers() // 重新加载数据
    } catch (error) {
      console.error('保存用户失败', error)
      message.error('保存用户失败')
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
      title="用户管理"
      extra={
        <Space>
          <Input
            placeholder="搜索用户名或邮箱"
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
            新增用户
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={users}
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
        <Column
          title="头像"
          key="avatar"
          render={(_, record: User) => (
            <Avatar src={record.avatar} icon={<UserOutlined />} />
          )}
        />
        <Column title="用户名" dataIndex="account" key="account" />
        <Column title="邮箱" dataIndex="email" key="email" />
        <Column
          title="角色"
          key="roles"
          render={(_, record: any) => (
            <Space size={[0, 8]} wrap>
              {record.roles?.map((r: any) => (
                <Tag color="blue" key={r.role.id}>
                  {r.role.name}
                </Tag>
              ))}
            </Space>
          )}
        />
        <Column
          title="操作"
          key="action"
          render={(_, record: User) => (
            <Space size="middle">
              <Button type="link" onClick={() => viewUserDetails(record)}>
                查看
              </Button>
              <Button type="link" onClick={() => showModal(record)}>
                编辑
              </Button>
              <Popconfirm
                title="确定要删除这个用户吗？"
                onConfirm={() => handleDeleteUser(record.id)}
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

      {/* 编辑/创建用户模态框 */}
      <Modal
        title={editingUser ? '编辑用户' : '新增用户'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="account"
            label="用户名"
            rules={[{ required: true, message: '请输入用户名' }]}
          >
            <Input placeholder="请输入用户名" />
          </Form.Item>
          {!editingUser && (
            <Form.Item
              name="password"
              label="密码"
              rules={[{ required: true, message: '请输入密码' }]}
            >
              <Input.Password placeholder="请输入密码" />
            </Form.Item>
          )}
          <Form.Item
            name="email"
            label="邮箱"
            rules={[
              { required: true, message: '请输入邮箱' },
              { type: 'email', message: '请输入有效的邮箱地址' },
            ]}
          >
            <Input placeholder="请输入邮箱" />
          </Form.Item>
          <Form.Item
            name="avatar"
            label="头像URL"
          >
            <Input placeholder="请输入头像URL" />
          </Form.Item>
          <Form.Item
            name="roleIds"
            label="角色"
            rules={[{ required: true, message: '请选择至少一个角色' }]}
          >
            <Select
              mode="multiple"
              placeholder="请选择角色"
              style={{ width: '100%' }}
              options={roles.map((r) => ({
                label: r.name,
                value: r.id,
              }))}
            />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看用户详情模态框 */}
      <Modal
        title="用户详情"
        open={isViewModalVisible}
        onCancel={handleViewModalCancel}
        footer={[
          <Button key="close" onClick={handleViewModalCancel}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {viewingUser && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="用户名">{viewingUser.account}</Descriptions.Item>
            <Descriptions.Item label="邮箱">{viewingUser.email}</Descriptions.Item>
            <Descriptions.Item label="头像">
              {viewingUser.avatar ? (
                <Avatar src={viewingUser.avatar} size={64} />
              ) : (
                <Avatar icon={<UserOutlined />} size={64} />
              )}
            </Descriptions.Item>
            <Descriptions.Item label="角色">
              <Space size={[0, 8]} wrap>
                {viewingUser.roles?.map((r: any) => (
                  <Tag color="blue" key={r.role.id}>
                    {r.role.name}
                  </Tag>
                ))}
              </Space>
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(viewingUser.createdTime).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(viewingUser.updatedTime).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>