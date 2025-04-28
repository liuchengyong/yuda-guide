export interface Menu {
  id: number
  name: string
  path: string
  type: MenuType
  icon: string
  code: string
  parentId: number
  sort: number
  status: MenuStatus
  visible: boolean
  createdTime: Date
  updatedTime: Date
}

export enum MenuType {
  DIR = 1, // 目录
  MENU = 2, // 菜单
  BUTTON = 3, // 按钮
}

export enum MenuStatus {
  OPEN = 1, // 开启
  CLOSE = 2, // 关闭
}
