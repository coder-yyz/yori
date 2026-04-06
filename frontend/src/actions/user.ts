import type { SWRConfiguration } from 'swr';

import { useMemo } from 'react';
import useSWR, { mutate } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type AdminUsersData = {
  code: number;
  data: {
    list: any[];
    total: number;
    page: number;
    pageSize: number;
  };
};

type AdminUserData = {
  code: number;
  data: Record<string, any>;
};

// ----------------------------------------------------------------------

export function useGetAdminUsers(params?: {
  page?: number;
  pageSize?: number;
  role?: string;
  status?: string;
  search?: string;
}) {
  const url = params ? [endpoints.adminUser.list, { params }] : endpoints.adminUser.list;

  const { data, isLoading, error, isValidating } = useSWR<AdminUsersData>(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      users: data?.data?.list || [],
      usersTotal: data?.data?.total || 0,
      usersPage: data?.data?.page || 1,
      usersPageSize: data?.data?.pageSize || 10,
      usersLoading: isLoading,
      usersError: error,
      usersValidating: isValidating,
      usersEmpty: !isLoading && !data?.data?.list?.length,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------

export function useGetAdminUser(id: string) {
  const url = id ? `${endpoints.adminUser.detail}/${id}` : '';

  const { data, isLoading, error, isValidating } = useSWR<AdminUserData>(url, fetcher, swrOptions);

  return useMemo(
    () => ({
      user: data?.data || null,
      userLoading: isLoading,
      userError: error,
      userValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------

export async function adminCreateUser(data: {
  username: string;
  email: string;
  password: string;
  displayName?: string;
  photoURL?: string;
  role?: string;
}) {
  const res = await axios.post(endpoints.adminUser.create, data);

  await mutate(
    (key: any) => {
      const k = Array.isArray(key) ? key[0] : key;
      return typeof k === 'string' && k.includes('/admin/users');
    },
    undefined,
    { revalidate: true }
  );

  return res.data;
}

// ----------------------------------------------------------------------

export async function adminUpdateUserRole(id: string, role: string) {
  const res = await axios.put(`${endpoints.adminUser.updateRole}/${id}/role`, { role });

  await mutate(
    (key: any) => {
      const k = Array.isArray(key) ? key[0] : key;
      return typeof k === 'string' && k.includes('/admin/users');
    },
    undefined,
    { revalidate: true }
  );

  return res.data;
}

// ----------------------------------------------------------------------

export async function adminUpdateUserStatus(id: string, status: string) {
  const res = await axios.put(`${endpoints.adminUser.updateStatus}/${id}/status`, { status });

  await mutate(
    (key: any) => {
      const k = Array.isArray(key) ? key[0] : key;
      return typeof k === 'string' && k.includes('/admin/users');
    },
    undefined,
    { revalidate: true }
  );

  return res.data;
}

// ----------------------------------------------------------------------

export async function adminDeleteUser(id: string) {
  const res = await axios.delete(`${endpoints.adminUser.delete}/${id}`);

  await mutate(
    (key: any) => {
      const k = Array.isArray(key) ? key[0] : key;
      return typeof k === 'string' && k.includes('/admin/users');
    },
    undefined,
    { revalidate: true }
  );

  return res.data;
}

// ----------------------------------------------------------------------

export async function updateProfile(data: Record<string, any>) {
  const res = await axios.put(endpoints.me.root, data);

  await mutate(endpoints.auth.me);

  return res.data;
}

// ----------------------------------------------------------------------

export async function changePassword(data: { oldPassword: string; newPassword: string }) {
  const res = await axios.put(endpoints.me.password, data);
  return res.data;
}
