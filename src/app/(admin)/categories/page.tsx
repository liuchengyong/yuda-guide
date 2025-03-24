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
import { CategoryService } from '@/services/category.service'
import type { Category } from '@/types/category'

const { Column } = Table

export default function CategoriesPage() {
  // 状态定义
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(false)
  const [total, setTotal] = useState(0)
  const [current, setCurrent] = useState(1)
  const [pageSize, setPageSize] = useState(10)
  const [searchText, setSearchText] = useState('')
  const [isModalVisible, setIsModalVisible] = useState(false)
  const [isViewModalVisible, setIsViewModalVisible] = useState(false)
  const [editingCategory, setEditingCategory] = useState<Category | null>(null)
  const [viewingCategory, setViewingCategory] = useState<Category | null>(null)
  const [form] = Form.useForm()

  // 服务实例
  const categoryService = new CategoryService()

  // 加载分类数据
  const loadCategories = async (page = current, size = pageSize, search = searchText) => {
    setLoading(true)
    try {
      const result = await categoryService.findAll({
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

      setCategories(result.data)
      setTotal(result.total)
    } catch (error) {
      console.error('加载分类失败', error)
      message.error('加载分类失败')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadCategories()
  }, [])

  // 处理搜索
  const handleSearch = () => {
    setCurrent(1) // 重置到第一页
    loadCategories(1, pageSize, searchText)
  }

  // 处理分页变化
  const handleTableChange = (pagination: any) => {
    setCurrent(pagination.current)
    setPageSize(pagination.pageSize)
    loadCategories(pagination.current, pagination.pageSize, searchText)
  }

  // 处理删除分类
  const handleDeleteCategory = async (id: string) => {
    try {
      await categoryService.delete(id)
      message.success('删除分类成功')
      loadCategories() // 重新加载数据
    } catch (error) {
      console.error('删除分类失败', error)
      message.error('删除分类失败')
    }
  }

  // 打开编辑/创建模态框
  const showModal = (category?: Category) => {
    setEditingCategory(category || null)
    form.resetFields()
    if (category) {
      // 编辑模式，设置表单初始值
      form.setFieldsValue(category)
    }
    setIsModalVisible(true)
  }

  // 查看分类详情
  const viewCategoryDetails = (category: Category) => {
    setViewingCategory(category)
    setIsViewModalVisible(true)
  }

  // 处理模态框确认
  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingCategory) {
        // 更新分类
        await categoryService.update(editingCategory.id, values)
        message.success('更新分类成功')
      } else {
        // 创建分类
        await categoryService.create(values)
        message.success('创建分类成功')
      }
      setIsModalVisible(false)
      loadCategories() // 重新加载数据
    } catch (error) {
      console.error('保存分类失败', error)
      message.error('保存分类失败')
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
      title="分类管理"
      extra={
        <Space>
          <Input
            placeholder="搜索分类名称或描述"
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
            新增分类
          </Button>
        </Space>
      }
    >
      <Table
        dataSource={categories}
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
        <Column title="分类名称" dataIndex="name" key="name" />
        <Column title="描述" dataIndex="description" key="description" />
        <Column
          title="操作"
          key="action"
          render={(_, record: Category) => (
            <Space size="middle">
              <Button type="link" onClick={() => viewCategoryDetails(record)}>
                查看
              </Button>
              <Button type="link" onClick={() => showModal(record)}>
                编辑
              </Button>
              <Popconfirm
                title="确定要删除这个分类吗？"
                onConfirm={() => handleDeleteCategory(record.id)}
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

      {/* 编辑/创建分类模态框 */}
      <Modal
        title={editingCategory ? '编辑分类' : '新增分类'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={handleModalCancel}
        width={600}
      >
        <Form form={form} layout="vertical">
          <Form.Item
            name="name"
            label="分类名称"
            rules={[{ required: true, message: '请输入分类名称' }]}
          >
            <Input placeholder="请输入分类名称" />
          </Form.Item>
          <Form.Item
            name="description"
            label="分类描述"
            rules={[{ required: true, message: '请输入分类描述' }]}
          >
            <Input.TextArea placeholder="请输入分类描述" rows={3} />
          </Form.Item>
        </Form>
      </Modal>

      {/* 查看分类详情模态框 */}
      <Modal
        title="分类详情"
        open={isViewModalVisible}
        onCancel={handleViewModalCancel}
        footer={[
          <Button key="close" onClick={handleViewModalCancel}>
            关闭
          </Button>,
        ]}
        width={600}
      >
        {viewingCategory && (
          <Descriptions bordered column={1}>
            <Descriptions.Item label="分类名称">{viewingCategory.name}</Descriptions.Item>
            <Descriptions.Item label="分类描述">
              {viewingCategory.description}
            </Descriptions.Item>
            <Descriptions.Item label="创建时间">
              {new Date(viewingCategory.createdTime).toLocaleString()}
            </Descriptions.Item>
            <Descriptions.Item label="更新时间">
              {new Date(viewingCategory.updatedTime).toLocaleString()}
            </Descriptions.Item>
          </Descriptions>
        )}
      </Modal>
    </Card>
  )