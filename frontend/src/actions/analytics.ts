import { useMemo } from 'react';
import useSWR, { type SWRConfiguration } from 'swr';

import axios, { fetcher, endpoints } from 'src/lib/axios';

const swrOptions: SWRConfiguration = {
  revalidateIfStale: false,
  revalidateOnFocus: false,
  revalidateOnReconnect: false,
};

type CountItem = {
  count: number;
};

type TypeCount = CountItem & {
  eventType: string;
};

type DailyCount = CountItem & {
  date: string;
};

type DailyTrafficCount = {
  date: string;
  pv: number;
  uv: number;
};

type TopPage = CountItem & {
  pagePath: string;
};

type TopEvent = CountItem & {
  eventName: string;
};

type ErrorEvent = {
  id: string;
  eventName: string;
  pagePath: string;
  occurredAt: string;
  userId: string;
  city: string;
  country: string;
  ip: string;
  isLoggedIn: boolean;
  logTime: string;
  userInfo: string;
  meta: string;
};

type AnalyticsOverview = {
  days: number;
  totalEvents: number;
  totalPv: number;
  totalUv: number;
  pvPerUv: number;
  typeCounts: TypeCount[];
  dailyCounts: DailyCount[];
  dailyTraffic: DailyTrafficCount[];
  topPages: TopPage[];
  topEvents: TopEvent[];
  recentErrors: ErrorEvent[];
  updatedAt: string;
};

type ApiResponse<T> = {
  code: number;
  data: T;
  msg: string;
};

type EventItem = {
  id: string;
  eventType: string;
  eventName: string;
  pagePath: string;
  occurredAt: string;
  userId: string;
  city: string;
  country: string;
  ip: string;
  isLoggedIn: boolean;
  logTime: string;
  userInfo: string;
  meta: string;
};

type ExportAllParams = {
  eventType?: string;
  pageSize?: number;
  maxPages?: number;
};

type EventListData = {
  list: EventItem[];
  total: number;
  page: number;
  pageSize: number;
};

export function useGetAnalyticsOverview(days: number) {
  const url = [endpoints.adminAnalytics.overview, { params: { days } }] as const;
  const { data, isLoading, error, isValidating } = useSWR<ApiResponse<AnalyticsOverview>>(
    url,
    fetcher,
    swrOptions
  );

  return useMemo(
    () => ({
      overview: data?.data,
      overviewLoading: isLoading,
      overviewError: error,
      overviewValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}

export function useGetAnalyticsEvents(params: {
  page: number;
  pageSize: number;
  eventType?: string;
}) {
  const url = [endpoints.adminAnalytics.events, { params }] as const;
  const { data, isLoading, error, isValidating } = useSWR<ApiResponse<EventListData>>(
    url,
    fetcher,
    swrOptions
  );

  return useMemo(
    () => ({
      events: data?.data?.list || [],
      eventsTotal: data?.data?.total || 0,
      eventsLoading: isLoading,
      eventsError: error,
      eventsValidating: isValidating,
    }),
    [data?.data, error, isLoading, isValidating]
  );
}

export async function exportAllAnalyticsEvents(params: ExportAllParams = {}) {
  const pageSize = Math.min(Math.max(params.pageSize ?? 100, 1), 100);
  const maxPages = Math.max(params.maxPages ?? 300, 1);

  let page = 1;
  let total = 0;
  const allEvents: EventItem[] = [];

  while (page <= maxPages) {
    const res = await axios.get<ApiResponse<EventListData>>(endpoints.adminAnalytics.events, {
      params: {
        page,
        pageSize,
        eventType: params.eventType,
      },
    });

    const chunk = res.data?.data?.list || [];
    total = res.data?.data?.total || total;

    if (!chunk.length) break;

    allEvents.push(...chunk);

    if (allEvents.length >= total) break;
    page += 1;
  }

  return {
    events: allEvents,
    total,
  };
}
