/**
 * DTO (Data Transfer Object) 定义文件
 * 用于定义所有API接口的请求参数类型
 */
import { PaginationParams } from './api-interfaces'

// ==================== 通用DTO ====================

/**
 * ID参数DTO
 */
export interface IdDTO {
  id: string
}

// ==================== 用户相关DTO ====================

/**
 * 用户查询DTO
 */
export interface UserQueryDTO extends PaginationParams {
  keyword?: string
  roleId?: string
}

/**
 * 用户创建DTO
 */
export interface UserCreateDTO {
  account: string
  password: string
  email: string
  avatar?: string
  roles?: string[] // 角色ID数组
}

/**
 * 用户更新DTO
 */
export interface UserUpdateDTO {
  account?: string
  password?: string
  email?: string
  avatar?: string
  roles?: string[] // 角色ID数组
}

// ==================== 角色相关DTO ====================

/**
 * 角色查询DTO
 */
export interface RoleQueryDTO extends PaginationParams {
  keyword?: string
}

/**
 * 角色创建DTO
 */
export interface RoleCreateDTO {
  name: string
  description?: string
  permissions?: string[] // 权限ID数组
}

/**
 * 角色更新DTO
 */
export interface RoleUpdateDTO {
  name?: string
  description?: string
  permissions?: string[] // 权限ID数组
}

// ==================== 权限相关DTO ====================

/**
 * 权限查询DTO
 */
export interface PermissionQueryDTO extends PaginationParams {
  keyword?: string
  type?: 'system' | 'custom'
}

/**
 * 权限创建DTO
 */
export interface PermissionCreateDTO {
  name: string
  type: 'system' | 'custom'
  description?: string
}

/**
 * 权限更新DTO
 */
export interface PermissionUpdateDTO {
  name?: string
  type?: 'system' | 'custom'
  description?: string
}

// ==================== 分类相关DTO ====================

/**
 * 分类查询DTO
 */
export interface CategoryQueryDTO extends PaginationParams {
  keyword?: string
}

/**
 * 分类创建DTO
 */
export interface CategoryCreateDTO {
  name: string
  description?: string
  parentId?: string
}

/**
 * 分类更新DTO
 */
export interface CategoryUpdateDTO {
  name?: string
  description?: string
  parentId?: string
}

// ==================== 标签相关DTO ====================

/**
 * 标签查询DTO
 */
export interface TagQueryDTO extends PaginationParams {
  keyword?: string
  siteId?: string
}

/**
 * 标签创建DTO
 */
export interface TagCreateDTO {
  name: string
  description?: string
  sites?: string[] // 站点ID数组
}

/**
 * 标签更新DTO
 */
export interface TagUpdateDTO {
  name?: string
  description?: string
  sites?: string[] // 站点ID数组
}

// ==================== 站点相关DTO ====================

/**
 * 站点查询DTO
 */
export interface SiteQueryDTO extends PaginationParams {
  keyword?: string
  categoryId?: string
  tagId?: string
}

/**
 * 站点创建DTO
 */
export interface SiteCreateDTO {
  name: string
  url: string
  description?: string
  logo?: string
  categoryId: string
  tags?: string[] // 标签ID数组
}

/**
 * 站点更新DTO
 */
export interface SiteUpdateDTO {
  name?: string
  url?: string
  description?: string
  logo?: string
  categoryId?: string
  tags?: string[] // 标签ID数组
}

// ==================== 认证相关DTO ====================

/**
 * 登录DTO
 */
export interface LoginDTO {
  account: string
  password: string
  remember?: boolean
}

/**
 * 注册DTO
 */
export interface RegisterDTO {
  account: string
  password: string
  email: string
}
