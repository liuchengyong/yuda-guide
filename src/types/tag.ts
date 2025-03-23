import { BaseEntity } from './base'
import { Site, SiteTag } from './site'

// 标签实体
export interface Tag extends BaseEntity {
  name: string
  description?: string
  sites?: SiteTag[]
}
