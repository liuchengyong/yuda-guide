/**
 * API接口参数定义文件
 * 定义所有API接口的请求参数(Request)和响应参数(Response)类型
 */
import { PaginatedData } from './api'
import { User } from './user'
import { Role } from './role'
import { Permission } from './permission'
import { Category } from './category'
import { Tag } from './tag'
import { Site } from './site'

// ==================== 通用接口 ====================

/**
 * 分页查询参数
 */
export interface PaginationParams {
  page?: number
  pageSize?: number
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
}

/**
 * ID参数
 */
export interface IdParams {
  id: string
}

// ==================== 用户相关接口 ====================

/**
 * 用户查询参数
 */
export interface UserQueryParams extends PaginationParams {
  keyword?: string
  roleId?: string
}

/**
 * 用户创建请求
 */
export interface CreateUserRequest {
  account: string
  password: string
  email: string
  avatar?: string
  roles?: string[] // 角色ID数组
}

/**
 * 用户更新请求
 */
export interface UpdateUserRequest {
  account?: string
  password?: string
  email?: string
  avatar?: string
  roles?: string[] // 角色ID数组
}

/**
 * 用户响应
 */
export type UserResponse = User

/**
 * 用户列表响应
 */
export type UserListResponse = PaginatedData<User>

// ==================== 角色相关接口 ====================

/**
 * 角色查询参数
 */
export interface RoleQueryParams extends PaginationParams {
  keyword?: string
}

/**
 * 角色创建请求
 */
export interface CreateRoleRequest {
  name: string
  description?: string
  permissions?: string[] // 权限ID数组
}

/**
 * 角色更新请求
 */
export interface UpdateRoleRequest {
  name?: string
  description?: string
  permissions?: string[] // 权限ID数组
}

/**
 * 角色响应
 */
export type RoleResponse = Role

/**
 * 角色列表响应
 */
export type RoleListResponse = PaginatedData<Role>

// ==================== 权限相关接口 ====================

/**
 * 权限查询参数
 */
export interface PermissionQueryParams extends PaginationParams {
  keyword?: string
  type?: 'system' | 'custom'
}

/**
 * 权限创建请求
 */
export interface CreatePermissionRequest {
  name: string
  type: 'system' | 'custom'
  description?: string
}

/**
 * 权限更新请求
 */
export interface UpdatePermissionRequest {
  name?: string
  type?: 'system' | 'custom'
  description?: string
}

/**
 * 权限响应
 */
export type PermissionResponse = Permission

/**
 * 权限列表响应
 */
export type PermissionListResponse = PaginatedData<Permission>

// ==================== 分类相关接口 ====================

/**
 * 分类查询参数
 */
export interface CategoryQueryParams extends PaginationParams {
  keyword?: string
}

/**
 * 分类创建请求
 */
export interface CreateCategoryRequest {
  name: string
  description?: string
}

/**
 * 分类更新请求
 */
export interface UpdateCategoryRequest {
  name?: string
  description?: string
}

/**
 * 分类响应
 */
export type CategoryResponse = Category

/**
 * 分类列表响应
 */
export type CategoryListResponse = PaginatedData<Category>

// ==================== 标签相关接口 ====================

/**
 * 标签查询参数
 */
export interface TagQueryParams extends PaginationParams {
  keyword?: string
  siteId?: string
}

/**
 * 标签创建请求
 */
export interface CreateTagRequest {
  name: string
  description?: string
  sites?: string[] // 站点ID数组
}

/**
 * 标签更新请求
 */
export interface UpdateTagRequest {
  name?: string
  description?: string
  sites?: string[] // 站点ID数组
}

/**
 * 标签响应
 */
export type TagResponse = Tag

/**
 * 标签列表响应
 */
export type TagListResponse = PaginatedData<Tag>

// ==================== 站点相关接口 ====================

/**
 * 站点查询参数
 */
export interface SiteQueryParams extends PaginationParams {
  keyword?: string
  categoryId?: string
  tagId?: string
}

/**
 * 站点创建请求
 */
export interface CreateSiteRequest {
  name: string
  url: string
  description?: string
  logo?: string
  categoryId: string
  tags?: string[] // 标签ID数组
}

/**
 * 站点更新请求
 */
export interface UpdateSiteRequest {
  name?: string
  url?: string
  description?: string
  logo?: string
  categoryId?: string
  tags?: string[] // 标签ID数组
}

/**
 * 站点响应
 */
export type SiteResponse = Site

/**
 * 站点列表响应
 */
export type SiteListResponse = PaginatedData<Site>

// ==================== 认证相关接口 ====================

/**
 * 登录请求
 */
export interface LoginRequest {
  account: string
  password: string
  remember?: boolean
}

/**
 * 登录响应
 */
export interface LoginResponse {
  user: User
  token: string
  expiresAt: number
}

/**
 * 注册请求
 */
export interface RegisterRequest {
  account: string
  password: string
  email: string
}

/**
 * 注册响应
 */
export type RegisterResponse = User
