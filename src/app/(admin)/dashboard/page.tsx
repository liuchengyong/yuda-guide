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
  // const userService = new UserService()
  // const roleService = new RoleService()
  // const siteService = new SiteService()
  // const categoryService = new CategoryService()
  // const tagService = new TagService()

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
    </div>
  )