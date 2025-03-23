'use client'

import React, { useState, useEffect } from 'react'
import { Card, Row, Col, Statistic, List, Typography, Space, Tag, Spin } from 'antd'
import {
  UserOutlined,
  TeamOutlined,
  GlobalOutlined,
  AppstoreOutlined,
  TagsOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons'
import { UserService } from '@/services/user.service'
import { RoleService } from '@/services/role.service'
import { SiteService } from '@/services/site.service'
import { CategoryService } from '@/services/category.service'
import { TagService } from '@/services/tag.service'

const { Title, Text } = Typography

export default function DashboardPage() {
  // 状态定义
  const [userCount, setUserCount] = useState(0)
  const [roleCount, setRoleCount] = useState(0)
  const [siteCount, setSiteCount] = useState(0)
  const [categoryCount, setCategoryCount] = useState(0)
  const [tagCount, setTagCount] = useState(0)
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [recentSites, setRecentSites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // 服务实例
  const userService = new UserService()
  const roleService = new RoleService()
  const siteService = new SiteService()
  const categoryService = new CategoryService()
  const tagService = new TagService()

  // 加载统计数据
  const loadStatistics = async () => {
    setLoading(true)
    try {
      // 获取各实体数量
      const userResult = await userService.findAll({ take: 0 })
      const roleResult = await roleService.findAll({ take: 0 })
      const siteResult = await siteService.findAll({ take: 0 })
      const categoryResult = await categoryService.findAll({ take: 0 })
      const tagResult = await tagService.findAll({ take: 0 })

      setUserCount(userResult.total)
      setRoleCount(roleResult.total)
      setSiteCount(siteResult.total)
      setCategoryCount(categoryResult.total)
      setTagCount(tagResult.total)

      // 获取最近用户
      const recentUserResult = await userService.findAll({
        take: 5,
        orderBy: { createdTime: 'desc' },
      })
      setRecentUsers(recentUserResult.data)

      // 获取最近站点
      const recentSiteResult = await siteService.findAll({
        take: 5,
        orderBy: { createdTime: 'desc' },
      })
      setRecentSites(recentSiteResult.data)
    } catch (error) {
      console.error('加载统计数据失败', error)
      message.error('加载统计数据失败')
    } finally {
      setLoading(false)
    }
  }

  // 初始加载
  useEffect(() => {
    loadStatistics()
  }, [])

  // 格式化日期
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString()
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        <Spin size="large" />
      </div>
    )
  }

  return (
    <div>
      <Title level={2}>仪表盘</Title>
      <Row gutter={[16, 16]}>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="用户总数"
              value={userCount}
              prefix={<UserOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="角色总数"
              value={roleCount}
              prefix={<TeamOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="站点总数"
              value={siteCount}
              prefix={<GlobalOutlined />}
            />
          </Card>
        </Col>
        <Col xs={24} sm={12} md={8} lg={6}>
          <Card>
            <Statistic
              title="分类总数"
              value={categoryCount}
              prefix={<AppstoreOutlined />}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={[16, 16]} style={{ marginTop: '24px' }}>
        <Col xs={24} md={12}>
          <Card title="最近添加的用户" extra={<a href="/admin/users">查看全部</a>}>
            <List
              dataSource={recentUsers}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<Avatar icon={<UserOutlined />} src={item.avatar} />}
                    title={item.account}
                    description={item.email}
                  />
                  <div>
                    <Space>
                      <ClockCircleOutlined />
                      <Text type="secondary">{formatDate(item.createdTime)}</Text>
                    </Space>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
        <Col xs={24} md={12}>
          <Card title="最近添加的站点" extra={<a href="/admin/sites">查看全部</a>}>
            <List
              dataSource={recentSites}
              renderItem={(item) => (
                <List.Item>
                  <List.Item.Meta
                    avatar={<GlobalOutlined />}
                    title={item.name}
                    description={item.url}
                  />
                  <div>
                    <Space>
                      <ClockCircleOutlined />
                      <Text type="secondary">{formatDate(item.createdTime)}</Text>
                    </Space>
                  </div>
                </List.Item>
              )}
            />
          </Card>
        </Col>
      </Row>
    </div>
  )