import type { Tag, Comment, BlogItem, Category } from 'src/types/blog';

import { useMemo } from 'react';
import useSWR, { mutate, type SWRConfiguration } from 'swr';

import { BlogItemModel, TagModel, CategoryModel, CommentModel } from 'src/models';
import axios, { fetcher, modelFetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type BlogsData = {
  code: number;
  data: {
    list: BlogItem[];
    total: number;
    page: number;
    pageSize: number;
  };
};

export function useGetBlogs(params?: { page?: number; pageSize?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));

  const url = `${endpoints.blog.list}?${queryParams.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR<BlogsData>(
    url,
    (args) => modelFetcher(args, BlogItemModel, true),
    { ...swrOptions }
  );

  return useMemo(
    () => ({
      blogs: data?.data?.list || [],
      blogsTotal: data?.data?.total || 0,
      blogsLoading: isLoading,
      blogsError: error,
      blogsValidating: isValidating,
      blogsEmpty: !isLoading && !data?.data?.list?.length,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------

type AdminBlogsData = {
  code: number;
  data: {
    list: BlogItem[];
    total: number;
    page: number;
    pageSize: number;
  };
};

export function useGetAdminBlogs(
  params?: { page?: number; pageSize?: number; status?: string } | null
) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));
  if (params?.status) queryParams.set('status', params.status);

  const url = params ? `${endpoints.adminBlog.list}?${queryParams.toString()}` : null;

  const { data, isLoading, error, isValidating } = useSWR<AdminBlogsData>(
    url,
    (args) => modelFetcher(args, BlogItemModel, true),
    { ...swrOptions }
  );

  return useMemo(
    () => ({
      blogs: data?.data?.list || [],
      blogsTotal: data?.data?.total || 0,
      blogsLoading: isLoading,
      blogsError: error,
      blogsValidating: isValidating,
      blogsEmpty: !isLoading && !data?.data?.list?.length,
    }),
    [data?.data?.list, data?.data?.total, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------

export function useGetMyBlogs(
  params?: { page?: number; pageSize?: number; status?: string } | null
) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));
  if (params?.status) queryParams.set('status', params.status);

  const url = params ? `${endpoints.auth.me}/blogs?${queryParams.toString()}` : null;

  const { data, isLoading, error, isValidating } = useSWR<AdminBlogsData>(
    url,
    (args) => modelFetcher(args, BlogItemModel, true),
    { ...swrOptions }
  );

  return useMemo(
    () => ({
      blogs: data?.data?.list || [],
      blogsTotal: data?.data?.total || 0,
      blogsLoading: isLoading,
      blogsError: error,
      blogsValidating: isValidating,
      blogsEmpty: !isLoading && !data?.data?.list?.length,
    }),
    [data?.data?.list, data?.data?.total, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------

type BlogData = {
  code: number;
  data: BlogItem;
};

export function useGetBlog(id: string) {
  const url = id ? `${endpoints.blog.details}/${id}` : '';

  const { data, isLoading, error, isValidating } = useSWR<BlogData>(
    url,
    (args) => modelFetcher(args, BlogItemModel),
    { ...swrOptions }
  );

  return useMemo(
    () => ({
      blog: data?.data,
      isLoading,
      error,
      isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------

export function useGetAdminBlog(id: string) {
  const url = id ? `${endpoints.adminBlog.details}/${id}` : '';

  const { data, isLoading, error, isValidating } = useSWR<BlogData>(
    url,
    (args) => modelFetcher(args, BlogItemModel),
    { ...swrOptions }
  );

  return useMemo(
    () => ({
      blog: data?.data,
      isLoading,
      error,
      isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------

type LatestBlogsData = {
  code: number;
  data: BlogItem[];
};

export function useGetLatestBlogs(title: string) {
  const url = title ? [endpoints.blog.latest, { params: { title } }] : '';

  const { data, isLoading, error, isValidating } = useSWR<LatestBlogsData>(
    url,
    (args) => modelFetcher(args, BlogItemModel),
    { ...swrOptions }
  );

  return useMemo(() => {
    const latestBlogs = data?.data || [];
    return {
      latestBlogs,
      latestBlogsLoading: isLoading,
      latestBlogsError: error,
      latestBlogsValidating: isValidating,
      latestBlogsEmpty: !isLoading && !latestBlogs.length,
    };
  }, [data?.data, error, isLoading, isValidating]);
}

// ----------------------------------------------------------------------

type SearchResultsData = {
  code: number;
  data: {
    list: BlogItem[];
    total: number;
  };
};

export function useSearchBlogs(query: string) {
  const url = query ? [endpoints.blog.search, { params: { q: query } }] : '';

  const { data, isLoading, error, isValidating } = useSWR<SearchResultsData>(url, fetcher, {
    ...swrOptions,
    keepPreviousData: true,
  });

  return useMemo(() => {
    const searchResults = data?.data?.list || [];
    return {
      searchResults,
      searchLoading: isLoading,
      searchError: error,
      searchValidating: isValidating,
      searchEmpty: !isLoading && !isValidating && !searchResults.length,
    };
  }, [data?.data?.list, error, isLoading, isValidating]);
}

// ----------------------------------------------------------------------

type TagsData = {
  code: number;
  data: Tag[];
};

export function useGetAllTags() {
  const url = endpoints.tag.all;

  const { data, isLoading, error } = useSWR<TagsData>(
    url,
    (args) => modelFetcher(args, TagModel),
    swrOptions
  );

  return useMemo(
    () => ({
      tags: data?.data || [],
      tagsLoading: isLoading,
      tagsError: error,
    }),
    [data?.data, isLoading, error]
  );
}

// ----------------------------------------------------------------------

type TagListData = {
  code: number;
  data: {
    list: Tag[];
    total: number;
    page: number;
    pageSize: number;
  };
};

export function useGetTags(params?: { page?: number; pageSize?: number; search?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));
  if (params?.search) queryParams.set('search', params.search);

  const url = `${endpoints.tag.list}?${queryParams.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR<TagListData>(
    url,
    (args) => modelFetcher(args, TagModel, true),
    swrOptions
  );

  return useMemo(
    () => ({
      tags: data?.data?.list || [],
      tagsTotal: data?.data?.total || 0,
      tagsLoading: isLoading,
      tagsError: error,
      tagsValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------

type CategoriesData = {
  code: number;
  data: Category[];
};

export function useGetAllCategories() {
  const url = endpoints.category.all;

  const { data, isLoading, error } = useSWR<CategoriesData>(
    url,
    (args) => modelFetcher(args, CategoryModel),
    swrOptions
  );

  return useMemo(
    () => ({
      categories: data?.data || [],
      categoriesLoading: isLoading,
      categoriesError: error,
    }),
    [data?.data, isLoading, error]
  );
}

// ----------------------------------------------------------------------

type CategoryListData = {
  code: number;
  data: {
    list: Category[];
    total: number;
    page: number;
    pageSize: number;
  };
};

export function useGetCategories(params?: { page?: number; pageSize?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));

  const url = `${endpoints.category.list}?${queryParams.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR<CategoryListData>(
    url,
    (args) => modelFetcher(args, CategoryModel, true),
    swrOptions
  );

  return useMemo(
    () => ({
      categories: data?.data?.list || [],
      categoriesTotal: data?.data?.total || 0,
      categoriesLoading: isLoading,
      categoriesError: error,
      categoriesValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------
// Mutations
// ----------------------------------------------------------------------

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
  const res = await axios.post(endpoints.adminBlog.create, blogData);
  await mutate((key: string) => typeof key === 'string' && key.includes('/blogs'), undefined, {
    revalidate: true,
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
  const res = await axios.put(`${endpoints.adminBlog.update}/${id}`, blogData);
  await mutate((key: string) => typeof key === 'string' && key.includes('/blogs'), undefined, {
    revalidate: true,
  });
  return res.data;
}

export async function deleteBlog(id: string) {
  const res = await axios.delete(`${endpoints.adminBlog.delete}/${id}`);
  await mutate((key: string) => typeof key === 'string' && key.includes('/blogs'), undefined, {
    revalidate: true,
  });
  return res.data;
}

export async function uploadFile(file: File): Promise<{ url: string; id: string }> {
  const formData = new FormData();
  formData.append('file', file);

  const res = await axios.post(endpoints.upload.root, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  return res.data.data;
}

// ----------------------------------------------------------------------
// Tag Mutations
// ----------------------------------------------------------------------

const revalidateTags = async () => {
  await mutate(
    (key: any) => {
      const k = Array.isArray(key) ? key[0] : key;
      return typeof k === 'string' && k.includes('/tag');
    },
    undefined,
    { revalidate: true }
  );
};

export async function createTag(name: string) {
  const res = await axios.post(endpoints.adminTag.create, { name });
  await revalidateTags();
  return res.data;
}

export async function updateTag(id: string, name: string) {
  const res = await axios.put(`${endpoints.adminTag.update}/${id}`, { name });
  await revalidateTags();
  return res.data;
}

export async function deleteTag(id: string) {
  const res = await axios.delete(`${endpoints.adminTag.delete}/${id}`);
  await revalidateTags();
  return res.data;
}

// ----------------------------------------------------------------------
// Category Mutations
// ----------------------------------------------------------------------

const revalidateCategories = async () => {
  await mutate(
    (key: any) => {
      const k = Array.isArray(key) ? key[0] : key;
      return typeof k === 'string' && k.includes('/category');
    },
    undefined,
    { revalidate: true }
  );
};

export async function createCategory(data: {
  name: string;
  slug?: string;
  description?: string;
  coverUrl?: string;
  parentId?: number | null;
}) {
  const res = await axios.post(endpoints.adminCategory.create, data);
  await revalidateCategories();
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
  const res = await axios.put(`${endpoints.adminCategory.update}/${id}`, data);
  await revalidateCategories();
  return res.data;
}

export async function deleteCategory(id: string) {
  const res = await axios.delete(`${endpoints.adminCategory.delete}/${id}`);
  await revalidateCategories();
  return res.data;
}

// ----------------------------------------------------------------------
// Comment Hooks & Mutations
// ----------------------------------------------------------------------

type CommentsData = {
  code: number;
  data: {
    list: Comment[];
    total: number;
    page: number;
    pageSize: number;
  };
};

export function useGetComments(blogId: string, params?: { page?: number; pageSize?: number }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));

  const url = blogId
    ? `${endpoints.blog.details}/${blogId}/comments?${queryParams.toString()}`
    : '';

  const { data, isLoading, error, isValidating } = useSWR<CommentsData>(url, (args) => modelFetcher(args, CommentModel, true), {
    ...swrOptions,
    revalidateOnFocus: true,
  });

  return useMemo(
    () => ({
      comments: data?.data?.list || [],
      commentsTotal: data?.data?.total || 0,
      commentsLoading: isLoading,
      commentsError: error,
      commentsValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}

const revalidateComments = async () => {
  await mutate(
    (key: any) => {
      const k = Array.isArray(key) ? key[0] : key;
      return typeof k === 'string' && k.includes('/comments');
    },
    undefined,
    { revalidate: true }
  );
};

export async function createComment(data: { blogId: string; content: string; parentId?: string }) {
  const res = await axios.post(endpoints.comment.create, data);
  await revalidateComments();
  return res.data;
}

export async function updateComment(id: string, content: string) {
  const res = await axios.put(`${endpoints.comment.update}/${id}`, { content });
  await revalidateComments();
  return res.data;
}

export async function deleteComment(id: string) {
  const res = await axios.delete(`${endpoints.comment.delete}/${id}`);
  await revalidateComments();
  return res.data;
}

export async function likeComment(id: string) {
  const res = await axios.post(`${endpoints.comment.like}/${id}/like`);
  await revalidateComments();
  return res.data;
}
