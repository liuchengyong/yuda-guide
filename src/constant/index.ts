import { PaginationProps } from 'antd'

export const DEFAULT_PAGINATION: PaginationProps = {
  showSizeChanger: true,
  showQuickJumper: true,
  showTotal: (total) => `共 ${total} 条`,
  pageSizeOptions: [1, 5, 10, 20, 50, 100, 200, 500],
}
