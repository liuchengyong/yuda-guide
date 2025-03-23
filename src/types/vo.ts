/**
 * VO (View Object) 定义文件
 * 用于定义所有API接口的响应数据类型
 */
import { PaginatedData } from './api'
import { User } from './user'
import { Role } from './role'
import { Permission } from './permission'
import { Category } from './category'
import { Tag } from './tag'
import { Site } from './site'

// ==================== 通用VO ====================

/**
 * 分页数据VO
 */
export interface PaginatedVO<T = any> extends PaginatedData<T> {}

// ==================== 用户相关VO ====================

/**
 * 用户VO
 */
export interface UserVO extends User {
  // 可以在这里添加额外的视图属性
  roleNames?: string[] // 角色名称数组
}

/**
 * 用户列表VO
 */
export interface UserListVO extends PaginatedVO<UserVO> {}

// ==================== 角色相关VO ====================

/**
 * 角色VO
 */
export interface RoleVO extends Role {
  // 可以在这里添加额外的视图属性
  permissionCount?: number // 权限数量
}

/**
 * 角色列表VO
 */
export interface RoleListVO extends PaginatedVO<RoleVO> {}

// ==================== 权限相关VO ====================

/**
 * 权限VO
 */
export interface PermissionVO extends Permission {
  // 可以在这里添加额外的视图属性
  roleCount?: number // 关联的角色数量
}

/**
 * 权限列表VO
 */
export interface PermissionListVO extends PaginatedVO<PermissionVO> {}

// ==================== 分类相关VO ====================

/**
 * 分类VO
 */
export interface CategoryVO extends Category {
  // 可以在这里添加额外的视图属性
  siteCount?: number // 关联的站点数量
  hasChildren?: boolean // 是否有子分类
}

/**
 * 分类列表VO
 */
export interface CategoryListVO extends PaginatedVO<CategoryVO> {}

// ==================== 标签相关VO ====================

/**
 * 标签VO
 */
export interface TagVO extends Tag {
  // 可以在这里添加额外的视图属性
  siteCount?: number // 关联的站点数量
}

/**
 * 标签列表VO
 */
export interface TagListVO extends PaginatedVO<TagVO> {}

// ==================== 站点相关VO ====================

/**
 * 站点VO
 */
export interface SiteVO extends Site {
  // 可以在这里添加额外的视图属性
  categoryName?: string // 分类名称
  tagNames?: string[] // 标签名称数组
}

/**
 * 站点列表VO
 */
export interface SiteListVO extends PaginatedVO<SiteVO> {}

// ==================== 认证相关VO ====================

/**
 * 登录VO
 */
export interface LoginVO {
  user: UserVO
  token: string
  expiresAt: number
}

/**
 * 注册VO
 */
export type RegisterVO = UserVO
