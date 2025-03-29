import { UserStatus, UserStatusConfig } from './user.model'

/**
 * 用户状态选项
 */
export const USER_STATUS_OPTIONS: UserStatusConfig[] = [
  {
    label: '正常',
    value: UserStatus.Active,
    color: 'green',
  },
  {
    label: '禁用',
    value: UserStatus.Disabled,
    color: 'red',
  },
]
