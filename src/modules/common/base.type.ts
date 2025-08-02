export enum Status {
  Disabled = 0,
  Enabled = 1,
}
export interface StatusConfig {
  label: string
  value: Status
  color: string
}

export const STATUS_CONFIG: StatusConfig[] = [
  {
    label: '禁用',
    value: Status.Disabled,
    color: 'default',
  },
  {
    label: '启用',
    value: Status.Enabled,
    color: 'success',
  },
]
