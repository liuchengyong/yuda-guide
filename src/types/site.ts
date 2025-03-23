import { BaseEntity } from './base'
import { Category, CategorySite } from './category'
import { Tag } from './tag'

// 站点实体
export interface Site extends BaseEntity {
  url: string
  logo?: string
  name: string
  description?: string
  tags?: SiteTag[]
  categories?: CategorySite[]
}

// 站点-标签关联
export interface SiteTag extends BaseEntity {
  siteId: string
  tagId: string
  site?: Site
  tag?: Tag
}
