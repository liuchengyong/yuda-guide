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
  Descriptions,
} from 'antd'
import { PlusOutlined, SearchOutlined } from '@ant-design/icons'
import { PermissionService } from '@/services/permission.service'
import type { Permission } from '@/types/permission'

const { Column } = Table

export default function PermissionsPage() {
  // 状态定义
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [editingPermission, setEditingPermission] = useState<Permission | null>(null)
  const [viewingPermission, setViewingPermission] = useState<Permission | null>(null)
  const [form] = Form.useForm()

  // 服务实例
  const permissionService = new PermissionService()

  // 加载权限数据
  const loadPermissions = async (page = current, size = pageSize, search = searchText) => {
    setLoading(true)
    try {
      const result = await permissionService.findAll({
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
      })

      setPermissions(result.data)
      setTotal(result.total)
    } catch (error) {
      console.error('加载权限失败', error)
      message.error('加载权限失败')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadPermissions()
  }, [])

  // 处理搜索
  const handleSearch = () => {
    setCurrent(1) // 重置到第一页
    loadPermissions(1, pageSize, searchText)
  }

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setCurrent(pagination.current)
    setPageSize(pagination.pageSize)
    loadPermissions(pagination.current, pagination.pageSize, searchText)
  }

  // 处理删除权限
  const handleDeletePermission = async (id: string) => {
    try {
      await permissionService.delete(id)
      message.success('删除权限成功')
      loadPermissions() // 重新加载数据
    } catch (error) {
      console.error('删除权限失败', error)
      message.error('删除权限失败')
    }
  }

  // 打开编辑/创建模态框
  const showModal = (permission?: Permission) => {
    setEditingPermission(permission || null)
    form.resetFields()
    if (permission) {
      // 编辑模式，设置表单初始值
      form.setFieldsValue(permission)
    }
    setIsModalVisible(true)
  }

  // 查看权限详情
  const viewPermissionDetails = (permission: Permission) => {
    setViewingPermission(permission)
    setIsViewModalVisible(true)
  }

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingPermission) {
        // 更新权限
        await permissionService.update(editingPermission.id, values)
        message.success('更新权限成功')
      } else {
        // 创建权限
        await permissionService.create(values)
        message.success('创建权限成功')
      }
      setIsModalVisible(false)
      loadPermissions() // 重新加载数据
    } catch (error) {
      console.error('保存权限失败', error)
      message.error('保存权限失败')
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
      title="权限管理"
      extra={
        <Space>
          <Input
            placeholder="搜索权限名称或描述"
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
            新增权限
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={permissions}
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
        <Column title="权限名称" dataIndex="name" key="name" />
        <Column title="描述" dataIndex="description" key="description" />
        <Column
          title="操作"
          key="action"
          render={(_, record: Permission) => (
            <Space size="middle">
              <Button type="link" onClick={() => viewPermissionDetails(record)}>
                查看
              </Button>
              <Button type="link" onClick={() => showModal(record)}>
                编辑
              </Button>
              <Popconfirm
                title="确定要删除这个权限吗？"
                onConfirm={() => handleDeletePermission(record.id)}
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

      {/* 编辑/创建权限模态框 */}
      <Modal
        title={editingPermission ? '编辑权限' : '新增权限'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="权限名称"
            rules={[{ required: true, message: '请输入权限名称' }]}
          >
            <Input placeholder="请输入权限名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="权限描述"
            rules={[{ required: true, message: '请输入权限描述' }]}
          >
            <Input.TextArea placeholder="请输入权限描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看权限详情模态框 */}
      <Modal
        title="权限详情"
        open={isViewModalVisible}
        onCancel={handleViewModalCancel}
        footer={[
          <Button key="close" onClick={handleViewModalCancel}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {viewingPermission && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="权限名称">{viewingPermission.name}</Descriptions.Item>
            <Descriptions.Item label="权限描述">
              {viewingPermission.description}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(viewingPermission.createdTime).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(viewingPermission.updatedTime).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )