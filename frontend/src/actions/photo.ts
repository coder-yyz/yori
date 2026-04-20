import type { PhotoItem, PhotoTag } from 'src/types/photo';

import { useMemo } from 'react';
import useSWR, { mutate, type SWRConfiguration } from 'swr';

import { PhotoItemModel, PhotoTagModel } from 'src/models';
import axios, { fetcher, modelFetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ──── 公开接口 ────

type PhotosData = {
  code: number;
  data: {
    list: PhotoItem[];
    total: number;
    page: number;
    pageSize: number;
  };
};

export function useGetPhotos(params?: { page?: number; pageSize?: number; tag?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));
  if (params?.tag) queryParams.set('tag', params.tag);

  const url = `${endpoints.photo.list}?${queryParams.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR<PhotosData>(
    url,
    (args) => modelFetcher(args, PhotoItemModel, true),
    swrOptions
  );

  return useMemo(
    () => ({
      photos: data?.data?.list || [],
      photosTotal: data?.data?.total || 0,
      photosLoading: isLoading,
      photosError: error,
      photosValidating: isValidating,
      photosEmpty: !isLoading && !data?.data?.list?.length,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}

type AllPhotosData = {
  code: number;
  data: {
    list: PhotoItem[];
    total: number;
  };
};

export function useGetAllPhotos(tag?: string) {
  const queryParams = new URLSearchParams();
  if (tag) queryParams.set('tag', tag);

  const url = `${endpoints.photo.all}?${queryParams.toString()}`;

  const { data, isLoading, error } = useSWR<AllPhotosData>(
    url,
    (args) => modelFetcher(args, PhotoItemModel, true),
    swrOptions
  );

  return useMemo(
    () => ({
      photos: data?.data?.list || [],
      photosTotal: data?.data?.total || 0,
      photosLoading: isLoading,
      photosError: error,
      photosEmpty: !isLoading && !data?.data?.list?.length,
    }),
    [data?.data, error, isLoading]
  );
}

type PhotoTagsData = {
  code: number;
  data: PhotoTag[];
};

export function useGetPhotoTags() {
  const { data, isLoading, error } = useSWR<PhotoTagsData>(
    endpoints.photo.tags,
    (args) => modelFetcher(args, PhotoTagModel),
    swrOptions
  );

  return useMemo(
    () => ({
      tags: data?.data || [],
      tagsLoading: isLoading,
      tagsError: error,
    }),
    [data?.data, error, isLoading]
  );
}

// ──── 管理接口 ────

type AdminPhotosData = {
  code: number;
  data: {
    list: PhotoItem[];
    total: number;
    page: number;
    pageSize: number;
  };
};

export function useGetAdminPhotos(params?: { page?: number; pageSize?: number; tag?: string }) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));
  if (params?.tag) queryParams.set('tag', params.tag);

  const url = `${endpoints.adminPhoto.list}?${queryParams.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR<AdminPhotosData>(
    url,
    (args) => modelFetcher(args, PhotoItemModel, true),
    swrOptions
  );

  return useMemo(
    () => ({
      photos: data?.data?.list || [],
      photosTotal: data?.data?.total || 0,
      photosLoading: isLoading,
      photosError: error,
      photosValidating: isValidating,
      photosEmpty: !isLoading && !data?.data?.list?.length,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}

export async function adminUploadPhoto(formData: FormData) {
  const res = await axios.post(endpoints.adminPhoto.upload, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

  mutatePhotoLists();
  return res.data;
}

export async function adminUpdatePhoto(
  id: string,
  data: { title: string; description: string; tagIds: string[] }
) {
  const res = await axios.put(`${endpoints.adminPhoto.update}/${id}`, data);
  mutatePhotoLists();
  return res.data;
}

export async function adminDeletePhoto(id: string) {
  const res = await axios.delete(`${endpoints.adminPhoto.delete}/${id}`);
  mutatePhotoLists();
  return res.data;
}

// ──── PhotoTag 管理 ────

type AdminPhotoTagsData = {
  code: number;
  data: {
    list: PhotoTag[];
    total: number;
    page: number;
    pageSize: number;
  };
};

export function useGetAdminPhotoTags(params?: {
  page?: number;
  pageSize?: number;
  search?: string;
}) {
  const queryParams = new URLSearchParams();
  if (params?.page) queryParams.set('page', String(params.page));
  if (params?.pageSize) queryParams.set('pageSize', String(params.pageSize));
  if (params?.search) queryParams.set('search', params.search);

  const url = `${endpoints.adminPhotoTag.list}?${queryParams.toString()}`;

  const { data, isLoading, error, isValidating } = useSWR<AdminPhotoTagsData>(
    url,
    (args) => modelFetcher(args, PhotoTagModel, true),
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

export async function adminCreatePhotoTag(data: { name: string }) {
  const res = await axios.post(endpoints.adminPhotoTag.create, data);
  mutatePhotoTagLists();
  return res.data;
}

export async function adminUpdatePhotoTag(id: string, data: { name: string }) {
  const res = await axios.put(`${endpoints.adminPhotoTag.update}/${id}`, data);
  mutatePhotoTagLists();
  return res.data;
}

export async function adminDeletePhotoTag(id: string) {
  const res = await axios.delete(`${endpoints.adminPhotoTag.delete}/${id}`);
  mutatePhotoTagLists();
  return res.data;
}

// ──── 辅助 ────

function mutatePhotoLists() {
  mutate(
    (key: any) => {
      const k = Array.isArray(key) ? key[0] : key;
      return typeof k === 'string' && (k.includes('/photo') || k.includes('/admin/photos'));
    },
    undefined,
    { revalidate: true }
  );
}

function mutatePhotoTagLists() {
  mutate(
    (key: any) => {
      const k = Array.isArray(key) ? key[0] : key;
      return typeof k === 'string' && (k.includes('/photo-tag') || k.includes('/photo/tags'));
    },
    undefined,
    { revalidate: true }
  );
}
