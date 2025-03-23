/**
 * 数据映射工具
 * 用于DTO和VO之间的转换
 */
import {
  UserCreateDTO,
  UserUpdateDTO,
  UserQueryDTO,
  RoleCreateDTO,
  RoleUpdateDTO,
  RoleQueryDTO,
  PermissionCreateDTO,
  PermissionUpdateDTO,
  PermissionQueryDTO,
  CategoryCreateDTO,
  CategoryUpdateDTO,
  CategoryQueryDTO,
  TagCreateDTO,
  TagUpdateDTO,
  TagQueryDTO,
  SiteCreateDTO,
  SiteUpdateDTO,
  SiteQueryDTO,
  LoginDTO,
  RegisterDTO,
} from './dto'

import {
  UserVO,
  UserListVO,
  RoleVO,
  RoleListVO,
  PermissionVO,
  PermissionListVO,
  CategoryVO,
  CategoryListVO,
  TagVO,
  TagListVO,
  SiteVO,
  SiteListVO,
  LoginVO,
  RegisterVO,
} from './vo'

import { User, Role, Permission, Category, Tag, Site } from './index'

// ==================== 用户相关映射 ====================

/**
 * 将用户创建DTO转换为用户实体
 */
export function userCreateDtoToEntity(dto: UserCreateDTO): Partial<User> {
  const { roles, ...userData } = dto
  return userData
}

/**
 * 将用户更新DTO转换为用户实体
 */
export function userUpdateDtoToEntity(dto: UserUpdateDTO): Partial<User> {
  const { roles, ...userData } = dto
  return userData
}

/**
 * 将用户实体转换为用户VO
 */
export function userEntityToVo(user: User): UserVO {
  return {
    ...user,
    roleNames: user.roles?.map((ur) => ur.role?.name || '') || [],
  }
}

// ==================== 角色相关映射 ====================

/**
 * 将角色创建DTO转换为角色实体
 */
export function roleCreateDtoToEntity(dto: RoleCreateDTO): Partial<Role> {
  const { permissions, ...roleData } = dto
  return roleData
}

/**
 * 将角色更新DTO转换为角色实体
 */
export function roleUpdateDtoToEntity(dto: RoleUpdateDTO): Partial<Role> {
  const { permissions, ...roleData } = dto
  return roleData
}

/**
 * 将角色实体转换为角色VO
 */
export function roleEntityToVo(role: Role): RoleVO {
  return {
    ...role,
    permissionCount: role.permissions?.length || 0,
  }
}

// ==================== 权限相关映射 ====================

/**
 * 将权限创建DTO转换为权限实体
 */
export function permissionCreateDtoToEntity(
  dto: PermissionCreateDTO,
): Partial<Permission> {
  return dto
}

/**
 * 将权限更新DTO转换为权限实体
 */
export function permissionUpdateDtoToEntity(
  dto: PermissionUpdateDTO,
): Partial<Permission> {
  return dto
}

/**
 * 将权限实体转换为权限VO
 */
export function permissionEntityToVo(permission: Permission): PermissionVO {
  return {
    ...permission,
    roleCount: permission.roles?.length || 0,
  }
}

// ==================== 分类相关映射 ====================

/**
 * 将分类创建DTO转换为分类实体
 */
export function categoryCreateDtoToEntity(
  dto: CategoryCreateDTO,
): Partial<Category> {
  return dto
}

/**
 * 将分类更新DTO转换为分类实体
 */
export function categoryUpdateDtoToEntity(
  dto: CategoryUpdateDTO,
): Partial<Category> {
  return dto
}

/**
 * 将分类实体转换为分类VO
 */
export function categoryEntityToVo(category: Category): CategoryVO {
  return {
    ...category,
    siteCount: category.sites?.length || 0,
    hasChildren: (category.children?.length || 0) > 0,
  }
}

// ==================== 标签相关映射 ====================

/**
 * 将标签创建DTO转换为标签实体
 */
export function tagCreateDtoToEntity(dto: TagCreateDTO): Partial<Tag> {
  const { sites, ...tagData } = dto
  return tagData
}

/**
 * 将标签更新DTO转换为标签实体
 */
export function tagUpdateDtoToEntity(dto: TagUpdateDTO): Partial<Tag> {
  const { sites, ...tagData } = dto
  return tagData
}

/**
 * 将标签实体转换为标签VO
 */
export function tagEntityToVo(tag: Tag): TagVO {
  return {
    ...tag,
    siteCount: tag.sites?.length || 0,
  }
}

// ==================== 站点相关映射 ====================

/**
 * 将站点创建DTO转换为站点实体
 */
export function siteCreateDtoToEntity(dto: SiteCreateDTO): Partial<Site> {
  const { tags, ...siteData } = dto
  return siteData
}

/**
 * 将站点更新DTO转换为站点实体
 */
export function siteUpdateDtoToEntity(dto: SiteUpdateDTO): Partial<Site> {
  const { tags, ...siteData } = dto
  return siteData
}

/**
 * 将站点实体转换为站点VO
 */
export function siteEntityToVo(site: Site): SiteVO {
  return {
    ...site,
    categoryName: site.categories?.[0]?.category?.name || '',
    tagNames: site.tags?.map((st) => st.tag?.name || '') || [],
  }
}
