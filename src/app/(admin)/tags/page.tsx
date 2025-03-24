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
import { TagService } from '@/services/tag.service'
import type { Tag } from '@/types/tag'

const { Column } = Table

export default function TagsPage() {
  // 状态定义
  const [tags, setTags] = useState<Tag[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [editingTag, setEditingTag] = useState<Tag | null>(null)
  const [viewingTag, setViewingTag] = useState<Tag | null>(null)
  const [form] = Form.useForm()

  // 服务实例
  const tagService = new TagService()

  // 加载标签数据
  const loadTags = async (
    page = current,
    size = pageSize,
    search = searchText,
  ) => {
    setLoading(true)
    try {
      const result = await tagService.findAll({
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

      setTags(result.data)
      setTotal(result.total)
    } catch (error) {
      console.error('加载标签失败', error)
      message.error('加载标签失败')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadTags()
  }, [])

  // 处理搜索
  const handleSearch = () => {
    setCurrent(1) // 重置到第一页
    loadTags(1, pageSize, searchText)
  }

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setCurrent(pagination.current)
    setPageSize(pagination.pageSize)
    loadTags(pagination.current, pagination.pageSize, searchText)
  }

  // 处理删除标签
  const handleDeleteTag = async (id: string) => {
    try {
      await tagService.delete(id)
      message.success('删除标签成功')
      loadTags() // 重新加载数据
    } catch (error) {
      console.error('删除标签失败', error)
      message.error('删除标签失败')
    }
  }

  // 打开编辑/创建模态框
  const showModal = (tag?: Tag) => {
    setEditingTag(tag || null)
    form.resetFields()
    if (tag) {
      // 编辑模式，设置表单初始值
      form.setFieldsValue(tag)
    }
    setIsModalVisible(true)
  }

  // 查看标签详情
  const viewTagDetails = (tag: Tag) => {
    setViewingTag(tag)
    setIsViewModalVisible(true)
  }

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingTag) {
        // 更新标签
        await tagService.update(editingTag.id, values)
        message.success('更新标签成功')
      } else {
        // 创建标签
        await tagService.create(values)
        message.success('创建标签成功')
      }
      setIsModalVisible(false)
      loadTags() // 重新加载数据
    } catch (error) {
      console.error('保存标签失败', error)
      message.error('保存标签失败')
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
      title="标签管理"
      extra={
        <Space>
          <Input
            placeholder="搜索标签名称或描述"
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
            新增标签
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={tags}
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
        <Column title="标签名称" dataIndex="name" key="name" />
        <Column title="描述" dataIndex="description" key="description" />
        <Column
          title="操作"
          key="action"
          render={(_, record: Tag) => (
            <Space size="middle">
              <Button type="link" onClick={() => viewTagDetails(record)}>
                查看
              </Button>
              <Button type="link" onClick={() => showModal(record)}>
                编辑
              </Button>
              <Popconfirm
                title="确定要删除这个标签吗？"
                onConfirm={() => handleDeleteTag(record.id)}
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

      {/* 编辑/创建标签模态框 */}
      <Modal
        title={editingTag ? '编辑标签' : '新增标签'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="标签名称"
            rules={[{ required: true, message: '请输入标签名称' }]}
          >
            <Input placeholder="请输入标签名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="标签描述"
            rules={[{ required: true, message: '请输入标签描述' }]}
          >
            <Input.TextArea placeholder="请输入标签描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看标签详情模态框 */}
      <Modal
        title="标签详情"
        open={isViewModalVisible}
        onCancel={handleViewModalCancel}
        footer={[
          <Button key="close" onClick={handleViewModalCancel}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {viewingTag && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="标签名称">
              {viewingTag.name}
            </Descriptions.Item>
            <Descriptions.Item label="标签描述">
              {viewingTag.description}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(viewingTag.createdTime).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(viewingTag.updatedTime).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )
}
