import { useMemo } from 'react';
import useSWR, { mutate, type SWRConfiguration } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';

// ----------------------------------------------------------------------

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

// ----------------------------------------------------------------------

type AdminUploadsData = {
  code: number;
  data: {
    list: any[];
    total: number;
    page: number;
    pageSize: number;
  };
};

// ----------------------------------------------------------------------

export function useGetAdminUploads(params?: { page?: number; pageSize?: number }) {
  const url = params ? [endpoints.adminUpload.list, { params }] : endpoints.adminUpload.list;

  const { data, isLoading, error, isValidating } = useSWR<AdminUploadsData>(
    url,
    fetcher,
    swrOptions
  );

  return useMemo(
    () => ({
      uploads: data?.data?.list || [],
      uploadsTotal: data?.data?.total || 0,
      uploadsLoading: isLoading,
      uploadsError: error,
      uploadsValidating: isValidating,
      uploadsEmpty: !isLoading && !data?.data?.list?.length,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}

// ----------------------------------------------------------------------

export async function adminDeleteUpload(id: string) {
  const res = await axios.delete(`${endpoints.adminUpload.delete}/${id}`);

  await mutate(
    (key: any) => {
      const k = Array.isArray(key) ? key[0] : key;
      return typeof k === 'string' && k.includes('/admin/uploads');
    },
    undefined,
    { revalidate: true }
  );

  return res.data;
}
