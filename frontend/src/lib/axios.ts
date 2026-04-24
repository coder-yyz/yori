import axios, { type AxiosRequestConfig } from 'axios';
import { type Model, createModel } from 'transform-model';

import { CONFIG } from 'src/global-config';

// ----------------------------------------------------------------------

const axiosInstance = axios.create({
  baseURL: CONFIG.serverUrl,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('jwt_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error?.response?.data?.msg ||
      error?.response?.data?.message ||
      error?.message ||
      'Something went wrong!';
    console.error('Axios error:', message);
    return Promise.reject(new Error(message));
  }
);

export default axiosInstance;

// ----------------------------------------------------------------------

export const fetcher = async <T = unknown>(
  args: string | [string, AxiosRequestConfig]
): Promise<T> => {
  try {
    const [url, config] = Array.isArray(args) ? args : [args, {}];

    const res = await axiosInstance.get<T>(url, config);

    return res.data;
  } catch (error) {
    console.error('Fetcher failed:', error);
    throw error;
  }
};

/**
 * modelFetcher —— 在 fetcher 基础上，对 res.data.data 中的列表或单项
 * 自动执行 createModel 映射，返回完整的 ApiResponse 结构（保留 code/msg 等字段）。
 *
 * 用法示例：
 *   useSWR(url, (args) => modelFetcher(args, BlogItemModel))       // 单项
 *   useSWR(url, (args) => modelFetcher(args, BlogItemModel, true)) // 列表分页
 */
export const modelFetcher = async <M extends Model, T = unknown>(
  args: string | [string, AxiosRequestConfig],
  ModelClass: new (data: any) => M,
  /** 是否为分页列表结构（data.list + data.total ...） */
  isList = false
): Promise<T> => {
  const raw = await fetcher<any>(args);

  if (!raw?.data) return raw as T;

  try {
    if (isList && Array.isArray(raw.data?.list)) {
      raw.data.list = createModel(ModelClass, raw.data.list);
    } else if (!isList && raw.data && !Array.isArray(raw.data)) {
      raw.data = createModel(ModelClass, raw.data);
    } else if (!isList && Array.isArray(raw.data)) {
      raw.data = createModel(ModelClass, raw.data);
    }
  } catch (e) {
    console.warn('[modelFetcher] Model mapping failed, returning raw data:', e);
  }

  return raw as T;
};

// ----------------------------------------------------------------------

export const endpoints = {
  chat: '/api/chat',
  kanban: '/api/kanban',
  calendar: '/api/calendar',
  auth: {
    me: '/api/me',
    signIn: '/api/auth/login',
    signUp: '/api/auth/register',
  },
  mail: {
    list: '/api/mail/list',
    details: '/api/mail/details',
    labels: '/api/mail/labels',
  },
  blog: {
    list: '/api/blog/list',
    details: '/api/blog/detail',
    latest: '/api/blog/latest',
    search: '/api/blog/search',
  },
  comment: {
    create: '/api/comments',
    update: '/api/comments',
    delete: '/api/comments',
    like: '/api/comments',
  },
  adminBlog: {
    list: '/api/admin/blogs/list',
    details: '/api/admin/blogs/detail',
    create: '/api/blogs',
    update: '/api/blogs',
    delete: '/api/blogs',
  },
  tag: {
    all: '/api/tag/all',
    list: '/api/tag/list',
  },
  category: {
    all: '/api/category/all',
    list: '/api/category/list',
  },
  adminTag: {
    create: '/api/admin/tags',
    update: '/api/admin/tags',
    delete: '/api/admin/tags',
  },
  adminCategory: {
    create: '/api/admin/categories',
    update: '/api/admin/categories',
    delete: '/api/admin/categories',
  },
  upload: {
    root: '/api/uploads',
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
  photo: {
    list: '/api/photo/list',
    all: '/api/photo/all',
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
  me: {
    root: '/api/me',
    password: '/api/me/password',
  },
  product: {
    list: '/api/product/list',
    details: '/api/product/details',
    search: '/api/product/search',
  },
} as const;
