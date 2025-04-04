'use client'
import { App, Button, Drawer, Space, Table } from 'antd'
import { useState, useEffect } from 'react'
import { request } from '../http/request'
import { Role } from '../role/role.model'
import { User, UserRole } from './user.model'
import type { ColumnsType } from 'antd/es/table'

interface UserRoleProps {
  open: boolean
  onClose: () => void
  currentUser: User | null
}

export const UserRoleDrawer: React.FC<UserRoleProps> = ({
  open,
  onClose,
  currentUser,
}) => {
  const { notification } = App.useApp()
  const [loading, setLoading] = useState(false)
  const [roles, setRoles] = useState<Role[]>([])
  const [selectedRowKeys, setSelectedRowKeys] = useState<string[]>([])

  // 加载角色数据
  const loadRoles = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      const response = await request.get<{}, Role>('/api/roles')

      if (response.code === 0 && response.datas) {
        setRoles(response.datas)

        // 设置已选角色
        const selectedKeys: string[] = []
        if (currentUser.roles && currentUser.roles.length > 0) {
          currentUser.roles.forEach((ur: UserRole) => {
            selectedKeys.push(ur.roleId)
          })
          setSelectedRowKeys(selectedKeys)
        }
      }
    } catch (error) {
      console.error('加载角色列表失败:', error)
      notification.error({
        message: '加载角色列表失败',
      })
    } finally {
      setLoading(false)
    }
  }

  // 保存角色分配
  const handleSave = async () => {
    if (!currentUser) return

    try {
      setLoading(true)
      const response = await request.post<any, any>(
        `/api/users/roles?userId=${currentUser.id}`,
        { roleIds: selectedRowKeys },
      )

      if (response.code === 0) {
        notification.success({
          message: '用户角色分配成功',
        })
        onClose()
      } else {
        notification.error({
          message: response.message || '用户角色分配失败',
        })
      }
    } catch (error) {
      console.error('保存用户角色失败:', error)
      notification.error({
        message: '保存用户角色失败',
      })
    } finally {
      setLoading(false)
    }
  }

  // 表格列定义
  const columns: ColumnsType<Role> = [
    {
      title: '角色名称',
      dataIndex: 'name',
    },
    {
      title: '角色编码',
      dataIndex: 'code',
    },
    {
      title: '描述',
      dataIndex: 'description',
      ellipsis: true,
    },
  ]

  // 表格选择配置
  const rowSelection = {
    selectedRowKeys,
    onChange: (selectedRowKeys: React.Key[]) => {
      setSelectedRowKeys(selectedRowKeys as string[])
    },
  }

  // 加载数据
  useEffect(() => {
    if (open && currentUser) {
      loadRoles()
    }
  }, [open, currentUser])

  return (
    <Drawer
      title={`分配用户角色: ${currentUser?.username || ''}`}
      open={open}
      width={700}
      onClose={onClose}
      destroyOnClose
      extra={
        <Space>
          <Button onClick={onClose}>取消</Button>
          <Button
            type="primary"
            onClick={handleSave}
            loading={loading}
            disabled={!currentUser}
          >
            保存
          </Button>
        </Space>
      }
    >
      <Table
        rowKey="id"
        rowSelection={rowSelection}
        columns={columns}
        dataSource={roles}
        loading={loading}
        pagination={false}
      />
    </Drawer>
  )
}
