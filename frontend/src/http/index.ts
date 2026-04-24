import { createModel } from 'transform-model';
import axios, { type AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios';

import {
  CommentModel,
  BlogTagModel,
  BlogItemModel,
  PhotoTagModel,
  PhotoItemModel,
  BlogCategoryModel,
} from 'src/models';

import { JWT_STORAGE_KEY } from 'src/auth/context/jwt/constant';

// ----------------------------------------------------------------------

const BASE_URL = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:2000';

export type ResponseData<T = unknown> = {
  success: boolean;
  data: T;
  message?: string;
};

// ----------------------------------------------------------------------

export const axiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// ----- Request interceptor: attach JWT -----
axiosInstance.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem(JWT_STORAGE_KEY);
    if (token) {
      config.headers.set('Authorization', `Bearer ${token}`);
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error)
);

// ----- Response interceptor: normalize errors -----
axiosInstance.interceptors.response.use(
  (response: AxiosResponse) => response,
  (error: AxiosError<ResponseData>) => {
    const message =
      error.response?.data?.message ||
      error.message ||
      `HTTP error! status: ${error.response?.status ?? 'unknown'}`;
    return Promise.reject(new Error(message));
  }
);

// ----------------------------------------------------------------------

export const endpoints = {
  auth: {
    me: '/api/me',
    signIn: '/api/auth/login',
    signUp: '/api/auth/register',
  },
  me: {
    root: '/api/me',
    password: '/api/me/password',
    blogs: '/api/me/blogs',
  },
  blog: {
    list: '/api/blog/list',
    detail: '/api/blog/detail',
    latest: '/api/blog/latest',
    search: '/api/blog/search',
    comments: (blogId: string) => `/api/blog/detail/${blogId}/comments`,
  },
  adminBlog: {
    list: '/api/admin/blogs/list',
    detail: '/api/admin/blogs/detail',
    create: '/api/blogs',
    update: '/api/blogs',
    delete: '/api/blogs',
  },
  comment: {
    root: '/api/comments',
  },
  tag: {
    all: '/api/tag/all',
    list: '/api/admin/tags',
    create: '/api/admin/tags',
    update: '/api/admin/tags',
    delete: '/api/admin/tags',
  },
  category: {
    all: '/api/category/all',
    list: '/api/admin/categories',
    create: '/api/admin/categories',
    update: '/api/admin/categories',
    delete: '/api/admin/categories',
  },
  photo: {
    all: '/api/photo/all',
    list: '/api/photo/list',
    tags: '/api/photo/tags',
  },
  adminPhoto: {
    list: '/api/admin/photos',
    upload: '/api/admin/photos',
    update: '/api/admin/photos',
    delete: '/api/admin/photos',
  },
  adminPhotoTag: {
    list: '/api/admin/photo-tags',
    create: '/api/admin/photo-tags',
    update: '/api/admin/photo-tags',
    delete: '/api/admin/photo-tags',
  },
  adminUser: {
    list: '/api/admin/users',
    detail: '/api/admin/users',
    create: '/api/admin/users',
    updateRole: '/api/admin/users',
    updateStatus: '/api/admin/users',
    delete: '/api/admin/users',
  },
  adminUpload: {
    list: '/api/admin/uploads',
    delete: '/api/admin/uploads',
  },
  upload: {
    root: '/api/uploads',
  },
} as const;

export default axiosInstance;

// ======================================================================
// 通用响应结构
// ======================================================================

type ListResp<T> = {
  code: number;
  data: {
    list: T[];
    total: number;
    page: number;
    pageSize: number;
  };
};

type ItemResp<T> = {
  code: number;
  data: T;
};

// ======================================================================
// Blog
// ======================================================================

export async function getBlogs(params?: { page?: number; pageSize?: number }) {
  const res = await axiosInstance.request<ListResp<any>>({
    url: endpoints.blog.list,
    method: 'GET',
    params,
  });
  return { list: createModel(BlogItemModel, res.data.data.list) as BlogItemModel[], total: res.data.data.total };
}

export async function getAdminBlogs(params?: {
  page?: number;
  pageSize?: number;
  status?: string;
}) {
  const res = await axiosInstance.request<ListResp<any>>({
    url: endpoints.adminBlog.list,
    method: 'GET',
    params,
  });
  return { list: createModel(BlogItemModel, res.data.data.list) as BlogItemModel[], total: res.data.data.total };
}

export async function getMyBlogs(params?: { page?: number; pageSize?: number; status?: string }) {
  const res = await axiosInstance.request<ListResp<any>>({
    url: endpoints.me.blogs,
    method: 'GET',
    params,
  });
  return { list: createModel(BlogItemModel, res.data.data.list) as BlogItemModel[], total: res.data.data.total };
}

export async function getBlog(id: string) {
  const res = await axiosInstance.request<ItemResp<any>>({
    url: `${endpoints.blog.detail}/${id}`,
    method: 'GET',
  });
  return createModel(BlogItemModel, res.data.data) as BlogItemModel;
}

export async function getAdminBlog(id: string) {
  const res = await axiosInstance.request<ItemResp<any>>({
    url: `${endpoints.adminBlog.detail}/${id}`,
    method: 'GET',
  });
  return createModel(BlogItemModel, res.data.data) as BlogItemModel;
}

export async function getLatestBlogs(title: string) {
  const res = await axiosInstance.request<{ code: number; data: any[] }>({
    url: endpoints.blog.latest,
    method: 'GET',
    params: { title },
  });
  return createModel(BlogItemModel, res.data.data) as BlogItemModel[];
}

export async function searchBlogs(query: string) {
  const res = await axiosInstance.request<{
    code: number;
    data: { list: any[]; total: number };
  }>({
    url: endpoints.blog.search,
    method: 'GET',
    params: { q: query },
  });
  return { list: res.data.data.list, total: res.data.data.total };
}

export async function createBlog(blogData: {
  title: string;
  content: string;
  description: string;
  coverUrl: string;
  status: string;
  tagIds: string[];
  categoryIds: string[];
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}) {
  const res = await axiosInstance.request({
    url: endpoints.adminBlog.create,
    method: 'POST',
    data: blogData,
  });
  return res.data;
}

export async function updateBlog(
  id: string,
  blogData: Partial<{
    title: string;
    content: string;
    description: string;
    coverUrl: string;
    status: string;
    tagIds: string[];
    categoryIds: string[];
    metaTitle: string;
    metaDescription: string;
    metaKeywords: string;
  }>
) {
  const res = await axiosInstance.request({
    url: `${endpoints.adminBlog.update}/${id}`,
    method: 'PUT',
    data: blogData,
  });
  return res.data;
}

export async function deleteBlog(id: string) {
  const res = await axiosInstance.request({
    url: `${endpoints.adminBlog.delete}/${id}`,
    method: 'DELETE',
  });
  return res.data;
}

export async function uploadFile(file: File): Promise<{ url: string; id: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axiosInstance.request({
    url: endpoints.upload.root,
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.data;
}

// ======================================================================
// Tag
// ======================================================================

export async function getAllTags(): Promise<BlogTagModel[]> {
  const res = await axiosInstance.request<{ code: number; data: any[] }>({
    url: endpoints.tag.all,
    method: 'GET',
  });
  return createModel(BlogTagModel, res.data.data) as BlogTagModel[];
}

export async function getTags(params?: { page?: number; pageSize?: number; search?: string }) {
  const res = await axiosInstance.request<ListResp<any>>({
    url: endpoints.tag.list,
    method: 'GET',
    params,
  });
  return { list: createModel(BlogTagModel, res.data.data.list) as BlogTagModel[], total: res.data.data.total };
}

export async function createTag(name: string) {
  const res = await axiosInstance.request({
    url: endpoints.tag.create,
    method: 'POST',
    data: { name },
  });
  return res.data;
}

export async function updateTag(id: string, name: string) {
  const res = await axiosInstance.request({
    url: `${endpoints.tag.update}/${id}`,
    method: 'PUT',
    data: { name },
  });
  return res.data;
}

export async function deleteTag(id: string) {
  const res = await axiosInstance.request({
    url: `${endpoints.tag.delete}/${id}`,
    method: 'DELETE',
  });
  return res.data;
}

// ======================================================================
// Category
// ======================================================================

export async function getAllCategories(): Promise<BlogCategoryModel[]> {
  const res = await axiosInstance.request<{ code: number; data: any[] }>({
    url: endpoints.category.all,
    method: 'GET',
  });
  return createModel(BlogCategoryModel, res.data.data) as BlogCategoryModel[];
}

export async function getCategories(params?: { page?: number; pageSize?: number }) {
  const res = await axiosInstance.request<ListResp<any>>({
    url: endpoints.category.list,
    method: 'GET',
    params,
  });
  return { list: createModel(BlogCategoryModel, res.data.data.list) as BlogCategoryModel[], total: res.data.data.total };
}

export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  coverUrl?: string;
  parentId?: number | null;
}) {
  const res = await axiosInstance.request({
    url: endpoints.category.create,
    method: 'POST',
    data,
  });
  return res.data;
}

export async function updateCategory(
  id: string,
  data: {
    name?: string;
    slug?: string;
    description?: string;
    coverUrl?: string;
    parentId?: number | null;
  }
) {
  const res = await axiosInstance.request({
    url: `${endpoints.category.update}/${id}`,
    method: 'PUT',
    data,
  });
  return res.data;
}

export async function deleteCategory(id: string) {
  const res = await axiosInstance.request({
    url: `${endpoints.category.delete}/${id}`,
    method: 'DELETE',
  });
  return res.data;
}

// ======================================================================
// Comment
// ======================================================================

export async function getComments(blogId: string, params?: { page?: number; pageSize?: number }) {
  const res = await axiosInstance.request<ListResp<any>>({
    url: endpoints.blog.comments(blogId),
    method: 'GET',
    params,
  });
  return { list: createModel(CommentModel, res.data.data.list) as CommentModel[], total: res.data.data.total };
}

export async function createComment(data: { blogId: string; content: string; parentId?: string }) {
  const res = await axiosInstance.request({
    url: endpoints.comment.root,
    method: 'POST',
    data,
  });
  return res.data;
}

export async function updateComment(id: string, content: string) {
  const res = await axiosInstance.request({
    url: `${endpoints.comment.root}/${id}`,
    method: 'PUT',
    data: { content },
  });
  return res.data;
}

export async function deleteComment(id: string) {
  const res = await axiosInstance.request({
    url: `${endpoints.comment.root}/${id}`,
    method: 'DELETE',
  });
  return res.data;
}

export async function likeComment(id: string) {
  const res = await axiosInstance.request({
    url: `${endpoints.comment.root}/${id}/like`,
    method: 'POST',
  });
  return res.data;
}

// ======================================================================
// Photo — Public
// ======================================================================

export async function getAllPublicPhotos(tag?: string) {
  const res = await axiosInstance.request<{ code: number; data: { list: any[]; total: number } }>({
    url: endpoints.photo.all,
    method: 'GET',
    params: tag ? { tag } : undefined,
  });
  return createModel(PhotoItemModel, res.data.data.list) as PhotoItemModel[];
}

export async function getAllPublicPhotoTags() {
  const res = await axiosInstance.request<{ code: number; data: any[] }>({
    url: endpoints.photo.tags,
    method: 'GET',
  });
  return createModel(PhotoTagModel, res.data.data) as PhotoTagModel[];
}

// ======================================================================
// Photo — Admin
// ======================================================================

export async function getAdminPhotos(params?: { page?: number; pageSize?: number; tag?: string }) {
  const res = await axiosInstance.request<ListResp<any>>({
    url: endpoints.adminPhoto.list,
    method: 'GET',
    params,
  });
  return { list: createModel(PhotoItemModel, res.data.data.list) as PhotoItemModel[], total: res.data.data.total };
}

export async function adminUploadPhoto(formData: FormData) {
  const res = await axiosInstance.request({
    url: endpoints.adminPhoto.upload,
    method: 'POST',
    data: formData,
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return res.data;
}

export async function adminUpdatePhoto(
  id: string,
  data: { title: string; description: string; tagIds: string[] }
) {
  const res = await axiosInstance.request({
    url: `${endpoints.adminPhoto.update}/${id}`,
    method: 'PUT',
    data,
  });
  return res.data;
}

export async function adminDeletePhoto(id: string) {
  const res = await axiosInstance.request({
    url: `${endpoints.adminPhoto.delete}/${id}`,
    method: 'DELETE',
  });
  return res.data;
}

export async function getAdminPhotoTags(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const res = await axiosInstance.request<ListResp<any>>({
    url: endpoints.adminPhotoTag.list,
    method: 'GET',
    params,
  });
  return { list: createModel(PhotoTagModel, res.data.data.list) as PhotoTagModel[], total: res.data.data.total };
}

export async function createPhotoTag(data: { name: string }) {
  const res = await axiosInstance.request({
    url: endpoints.adminPhotoTag.create,
    method: 'POST',
    data,
  });
  return res.data;
}

export async function updatePhotoTag(id: string, data: { name: string }) {
  const res = await axiosInstance.request({
    url: `${endpoints.adminPhotoTag.update}/${id}`,
    method: 'PUT',
    data,
  });
  return res.data;
}

export async function deletePhotoTag(id: string) {
  const res = await axiosInstance.request({
    url: `${endpoints.adminPhotoTag.delete}/${id}`,
    method: 'DELETE',
  });
  return res.data;
}

// Aliases (for backward compat with pages that use admin-prefixed names)
export const adminCreatePhotoTag = createPhotoTag;
export const adminUpdatePhotoTag = updatePhotoTag;
export const adminDeletePhotoTag = deletePhotoTag;

// ======================================================================
// User
// ======================================================================

export async function getUsersList(params?: {
  page?: number;
  pageSize?: number;
  role?: string;
  status?: string;
  search?: string;
}) {
  const res = await axiosInstance.request<ListResp<any>>({
    url: endpoints.adminUser.list,
    method: 'GET',
    params,
  });
  return { list: res.data.data.list, total: res.data.data.total };
}

export async function getUserDetail(id: string) {
  const res = await axiosInstance.request<ItemResp<Record<string, any>>>({
    url: `${endpoints.adminUser.detail}/${id}`,
    method: 'GET',
  });
  return res.data.data;
}

export async function createUser(data: {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
}) {
  const res = await axiosInstance.request({
    url: endpoints.adminUser.create,
    method: 'POST',
    data,
  });
  return res.data;
}

export async function updateUserRole(id: string, role: string) {
  const res = await axiosInstance.request({
    url: `${endpoints.adminUser.updateRole}/${id}/role`,
    method: 'PUT',
    data: { role },
  });
  return res.data;
}

export async function updateUserStatus(id: string, status: string) {
  const res = await axiosInstance.request({
    url: `${endpoints.adminUser.updateStatus}/${id}/status`,
    method: 'PUT',
    data: { status },
  });
  return res.data;
}

export async function deleteUser(id: string) {
  const res = await axiosInstance.request({
    url: `${endpoints.adminUser.delete}/${id}`,
    method: 'DELETE',
  });
  return res.data;
}

export async function updateProfile(data: Record<string, any>) {
  const res = await axiosInstance.request({
    url: endpoints.me.root,
    method: 'PUT',
    data,
  });
  return res.data;
}

export async function changePassword(data: { oldPassword: string; newPassword: string }) {
  const res = await axiosInstance.request({
    url: endpoints.me.password,
    method: 'PUT',
    data,
  });
  return res.data;
}

// Aliases
export const adminCreateUser = createUser;
export const adminDeleteUser = deleteUser;
export const adminUpdateUserRole = updateUserRole;
export const adminUpdateUserStatus = updateUserStatus;

// ======================================================================
// Upload
// ======================================================================

export async function getFileList(params?: { page?: number; pageSize?: number }) {
  const res = await axiosInstance.request<ListResp<any>>({
    url: endpoints.adminUpload.list,
    method: 'GET',
    params,
  });
  return { list: res.data.data.list, total: res.data.data.total };
}

export async function deleteFile(id: string) {
  const res = await axiosInstance.request({
    url: `${endpoints.adminUpload.delete}/${id}`,
    method: 'DELETE',
  });
  return res.data;
}

// Aliases
export const adminDeleteUpload = deleteFile;

