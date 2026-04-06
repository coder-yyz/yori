import type { AxiosRequestConfig } from 'axios';

import axios from 'axios';

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
