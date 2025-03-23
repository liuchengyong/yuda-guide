import { BaseEntity } from './base'
import { Site } from './site'

// 分类实体 (树结构)
export interface Category extends BaseEntity {
  name: string
  description?: string
  parentId?: string
  parent?: Category
  children?: Category[]
  sites?: CategorySite[]
}

// 分类-站点关联
export interface CategorySite extends BaseEntity {
  categoryId: string
  siteId: string
  category?: Category
  site?: Site
}
