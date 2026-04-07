import dayjs from 'dayjs';
import { useMemo, useState } from 'react';

import Box from '@mui/material/Box';
import Accordion from '@mui/material/Accordion';
import Button from '@mui/material/Button';
import Card from '@mui/material/Card';
import Chip from '@mui/material/Chip';
import Dialog from '@mui/material/Dialog';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import TableRow from '@mui/material/TableRow';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableHead from '@mui/material/TableHead';
import Typography from '@mui/material/Typography';
import FormControl from '@mui/material/FormControl';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import InputLabel from '@mui/material/InputLabel';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import AccordionSummary from '@mui/material/AccordionSummary';
import AccordionDetails from '@mui/material/AccordionDetails';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';

import { paths } from 'src/routes/paths';

import {
  exportAllAnalyticsEvents,
  useGetAnalyticsEvents,
  useGetAnalyticsOverview,
} from 'src/actions/analytics';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/Snackbar';
import { Iconify } from 'src/components/Iconify';
import { Chart, useChart } from 'src/components/Chart';
import { Scrollbar } from 'src/components/Scrollbar';
import { CustomBreadcrumbs } from 'src/components/CustomBreadcrumbs';

const EVENT_TYPE_COLORS: Record<string, 'default' | 'info' | 'warning' | 'error'> = {
  click: 'info',
  exposure: 'default',
  custom: 'warning',
  error: 'error',
};

type EventRow = {
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
  userInfo: string;
  meta: string;
};

function formatEventTypeName(eventType: string) {
  return eventType.charAt(0).toUpperCase() + eventType.slice(1);
}

function parseJSON(value?: string) {
  if (!value) return null;
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return null;
  }
}

async function copyJSON(label: string, value: Record<string, unknown>) {
  try {
    await navigator.clipboard.writeText(JSON.stringify(value, null, 2));
    toast.success(`${label} 已复制`);
  } catch {
    toast.error(`复制 ${label} 失败`);
  }
}

function downloadJSON(filename: string, payload: unknown) {
  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

function buildBasicInfo(event: EventRow) {
  return {
    id: event.id,
    eventType: event.eventType,
    eventName: event.eventName,
    pagePath: event.pagePath,
    occurredAt: event.occurredAt,
    userId: event.userId,
    ip: event.ip,
    city: event.city,
    country: event.country,
    isLoggedIn: event.isLoggedIn,
  };
}

function buildFullEventPayload(event: EventRow) {
  return {
    ...buildBasicInfo(event),
    userInfo: parseJSON(event.userInfo) || {},
    meta: parseJSON(event.meta) || {},
  };
}

function StatCard({ title, value }: { title: string; value: string | number }) {
  const isNumberValue = typeof value === 'number';
  return (
    <Card
      variant="outlined"
      data-track-exposure={`analytics_card_${title.toLowerCase().replace(/\s+/g, '_')}`}
      sx={{ height: '100%' }}
    >
      <Stack sx={{ p: 3 }} spacing={1}>
        <Typography variant="subtitle2" color="text.secondary">
          {title}
        </Typography>
        <Typography
          variant={isNumberValue ? 'h3' : 'subtitle1'}
          sx={
            isNumberValue
              ? undefined
              : {
                  wordBreak: 'break-all',
                  lineHeight: 1.4,
                  minHeight: 44,
                }
          }
        >
          {value}
        </Typography>
      </Stack>
    </Card>
  );
}

export function AnalyticsDashboardView() {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  const [days, setDays] = useState(7);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [eventType, setEventType] = useState('');
  const [selectedEvent, setSelectedEvent] = useState<EventRow | null>(null);
  const [copiedAction, setCopiedAction] = useState('');
  const [exportingAll, setExportingAll] = useState(false);

  const { overview, overviewLoading, overviewError } = useGetAnalyticsOverview(days);
  const { events, eventsTotal, eventsLoading } = useGetAnalyticsEvents({
    page: page + 1,
    pageSize: rowsPerPage,
    eventType,
  });

  const trendOptions = useChart({
    xaxis: {
      categories: overview?.dailyCounts?.map((item) => item.date) || [],
    },
    yaxis: {
      labels: { formatter: (value) => String(Math.round(value)) },
    },
    tooltip: {
      y: { formatter: (value) => `${Math.round(value)} events` },
    },
  });

  const typeOptions = useChart({
    labels: overview?.typeCounts?.map((item) => formatEventTypeName(item.eventType)) || [],
    legend: { show: true, position: 'bottom' },
  });

  const typeSeries = useMemo(
    () => overview?.typeCounts?.map((item) => item.count) || [],
    [overview?.typeCounts]
  );

  const handleCopy = async (actionKey: string, label: string, value: Record<string, unknown>) => {
    await copyJSON(label, value);
    setCopiedAction(actionKey);
    window.setTimeout(() => {
      setCopiedAction((prev) => (prev === actionKey ? '' : prev));
    }, 1500);
  };

  const handleExportCurrentEvents = () => {
    const fileTime = dayjs().format('YYYYMMDD_HHmmss');
    downloadJSON(`analytics-events-${fileTime}.json`, {
      exportedAt: new Date().toISOString(),
      filters: {
        days,
        eventType: eventType || 'all',
        page: page + 1,
        pageSize: rowsPerPage,
        scope: 'current-page',
      },
      total: eventsTotal,
      events,
    });
    toast.success('当前页事件 JSON 已导出');
  };

  const handleExportAllEvents = async () => {
    setExportingAll(true);
    try {
      const result = await exportAllAnalyticsEvents({
        eventType: eventType || undefined,
      });

      const fileTime = dayjs().format('YYYYMMDD_HHmmss');
      downloadJSON(`analytics-events-all-${fileTime}.json`, {
        exportedAt: new Date().toISOString(),
        filters: {
          days,
          eventType: eventType || 'all',
          scope: 'all-filtered',
        },
        total: result.total,
        events: result.events,
      });
      toast.success(`已导出 ${result.events.length} 条事件`);
    } catch (error: any) {
      toast.error(error?.message || '导出全量事件失败');
    } finally {
      setExportingAll(false);
    }
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Analytics Dashboard"
        links={[{ name: 'Dashboard', href: paths.admin.home }, { name: 'Analytics' }]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      {overviewError ? (
        <Alert severity="error" sx={{ mb: 3 }}>
          {overviewError.message || '加载分析数据失败'}
        </Alert>
      ) : null}

      <Card variant="outlined" sx={{ p: 2, mb: 3 }}>
        <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
          <FormControl sx={{ minWidth: 160, width: { xs: '100%', sm: 'auto' } }}>
            <InputLabel id="analytics-days-label">统计周期</InputLabel>
            <Select
              labelId="analytics-days-label"
              value={String(days)}
              label="统计周期"
              onChange={(event) => setDays(Number(event.target.value))}
              data-track-click="analytics_change_days"
            >
              <MenuItem value="7">最近 7 天</MenuItem>
              <MenuItem value="14">最近 14 天</MenuItem>
              <MenuItem value="30">最近 30 天</MenuItem>
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 160, width: { xs: '100%', sm: 'auto' } }}>
            <InputLabel id="analytics-type-label">事件类型</InputLabel>
            <Select
              labelId="analytics-type-label"
              value={eventType}
              label="事件类型"
              onChange={(event) => {
                setEventType(event.target.value);
                setPage(0);
              }}
            >
              <MenuItem value="">全部</MenuItem>
              <MenuItem value="exposure">曝光</MenuItem>
              <MenuItem value="click">点击</MenuItem>
              <MenuItem value="error">错误</MenuItem>
              <MenuItem value="custom">自定义</MenuItem>
            </Select>
          </FormControl>
        </Stack>
      </Card>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Total Events" value={overview?.totalEvents || 0} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Top Page" value={overview?.topPages?.[0]?.pagePath || '-'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard title="Top Event" value={overview?.topEvents?.[0]?.eventName || '-'} />
        </Grid>
        <Grid size={{ xs: 12, sm: 6, md: 3 }}>
          <StatCard
            title="Error Count"
            value={overview?.typeCounts?.find((v) => v.eventType === 'error')?.count || 0}
          />
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 8 }}>
          <Card variant="outlined" sx={{ p: 3 }} data-track-exposure="analytics_trend_chart">
            <Typography variant="h6" sx={{ mb: 2 }}>
              Event Trend
            </Typography>
            <Box sx={{ height: { xs: 280, md: 320 } }}>
              <Chart
                type="line"
                series={[
                  {
                    name: 'Events',
                    data: overview?.dailyCounts?.map((item) => item.count) || [],
                  },
                ]}
                options={trendOptions}
                sx={{ height: { xs: 280, md: 320 } }}
              />
            </Box>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 4 }}>
          <Card variant="outlined" sx={{ p: 3 }} data-track-exposure="analytics_type_chart">
            <Typography variant="h6" sx={{ mb: 2 }}>
              Event Type Share
            </Typography>
            <Box sx={{ height: { xs: 280, md: 320 } }}>
              <Chart
                type="donut"
                series={typeSeries}
                options={typeOptions}
                sx={{ height: { xs: 280, md: 320 } }}
              />
            </Box>
          </Card>
        </Grid>
      </Grid>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Top Pages
            </Typography>
            <Stack spacing={1}>
              {(overview?.topPages || []).map((item, index) => (
                <Stack
                  key={item.pagePath}
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  spacing={1.5}
                  sx={{
                    py: 1,
                    borderBottom:
                      index === (overview?.topPages?.length || 0) - 1
                        ? 'none'
                        : (themeVar) => `1px dashed ${themeVar.palette.divider}`,
                  }}
                >
                  <Typography
                    variant="body2"
                    color="text.secondary"
                    sx={{
                      pr: 1,
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}
                    title={item.pagePath || '-'}
                  >
                    {item.pagePath || '-'}
                  </Typography>
                  <Chip label={item.count} size="small" />
                </Stack>
              ))}
              {!overviewLoading && !overview?.topPages?.length ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  暂无数据
                </Typography>
              ) : null}
            </Stack>
          </Card>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Card variant="outlined" sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Recent Errors
            </Typography>
            <Stack spacing={1.25}>
              {(overview?.recentErrors || []).slice(0, 8).map((item) => (
                <Stack
                  key={item.id}
                  spacing={0.4}
                  sx={{
                    p: 1.25,
                    borderRadius: 1,
                    bgcolor: 'background.neutral',
                  }}
                >
                  <Typography variant="subtitle2">{item.eventName}</Typography>
                  <Typography variant="caption" color="text.secondary" sx={{ lineHeight: 1.5 }}>
                    {item.pagePath || '-'} ·{' '}
                    {item.city || item.country
                      ? `${item.city || '-'}, ${item.country || '-'}`
                      : '未知地区'}{' '}
                    · {dayjs(item.occurredAt).format('MM-DD HH:mm:ss')}
                  </Typography>
                </Stack>
              ))}
              {!overviewLoading && !overview?.recentErrors?.length ? (
                <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
                  暂无错误事件
                </Typography>
              ) : null}
            </Stack>
          </Card>
        </Grid>
      </Grid>

      <Card variant="outlined" data-track-exposure="analytics_events_table">
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          alignItems={{ xs: 'flex-start', sm: 'center' }}
          justifyContent="space-between"
          spacing={2}
          sx={{ px: 3, pt: 3 }}
        >
          <Typography variant="h6">Event Logs</Typography>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            spacing={1}
            sx={{ width: { xs: '100%', sm: 'auto' } }}
          >
            <Button
              size="small"
              variant="outlined"
              onClick={handleExportCurrentEvents}
              disabled={!events.length}
              startIcon={<Iconify icon="solar:export-bold" width={16} />}
              data-track-click="analytics_export_events_current"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              导出当前页
            </Button>
            <Button
              size="small"
              variant="contained"
              onClick={() => void handleExportAllEvents()}
              disabled={exportingAll}
              startIcon={
                exportingAll ? (
                  <CircularProgress size={14} color="inherit" />
                ) : (
                  <Iconify icon="solar:export-bold" width={16} />
                )
              }
              data-track-click="analytics_export_events_all"
              sx={{ width: { xs: '100%', sm: 'auto' } }}
            >
              {exportingAll ? '导出中...' : '导出筛选全量'}
            </Button>
          </Stack>
        </Stack>
        {isMobile ? (
          <Stack spacing={1.5} sx={{ p: 2 }}>
            {eventsLoading ? (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: 'center', py: 4 }}
              >
                Loading...
              </Typography>
            ) : events.length ? (
              events.map((item) => (
                <Card key={item.id} variant="outlined" sx={{ p: 2 }}>
                  <Stack spacing={1.25}>
                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Chip
                        size="small"
                        label={formatEventTypeName(item.eventType)}
                        color={EVENT_TYPE_COLORS[item.eventType] || 'default'}
                      />
                      <Typography
                        variant="caption"
                        color="text.secondary"
                        sx={{ whiteSpace: 'nowrap' }}
                      >
                        {dayjs(item.occurredAt).format('MM-DD HH:mm:ss')}
                      </Typography>
                    </Stack>

                    <Typography variant="subtitle2">{item.eventName}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      页面: {item.pagePath || '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      地区:{' '}
                      {item.city || item.country
                        ? `${item.city || '-'}, ${item.country || '-'}`
                        : '-'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      用户: {item.userId || '-'}
                    </Typography>

                    <Stack
                      direction="row"
                      justifyContent="space-between"
                      alignItems="center"
                      spacing={1}
                    >
                      <Chip
                        size="small"
                        label={item.isLoggedIn ? 'Logged In' : 'Guest'}
                        color={item.isLoggedIn ? 'success' : 'default'}
                        variant={item.isLoggedIn ? 'filled' : 'outlined'}
                      />
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={() => setSelectedEvent(item)}
                        data-track-click="analytics_open_event_detail"
                      >
                        详情
                      </Button>
                    </Stack>
                  </Stack>
                </Card>
              ))
            ) : (
              <Typography
                variant="body2"
                color="text.secondary"
                sx={{ textAlign: 'center', py: 4 }}
              >
                暂无数据
              </Typography>
            )}
          </Stack>
        ) : (
          <Scrollbar>
            <TableContainer sx={{ minWidth: 800 }}>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Type</TableCell>
                    <TableCell>Name</TableCell>
                    <TableCell>Page</TableCell>
                    <TableCell>Location</TableCell>
                    <TableCell>User</TableCell>
                    <TableCell>Login</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell align="right">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {eventsLoading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        Loading...
                      </TableCell>
                    </TableRow>
                  ) : events.length ? (
                    events.map((item) => (
                      <TableRow key={item.id} hover>
                        <TableCell>
                          <Chip
                            size="small"
                            label={formatEventTypeName(item.eventType)}
                            color={EVENT_TYPE_COLORS[item.eventType] || 'default'}
                          />
                        </TableCell>
                        <TableCell>{item.eventName}</TableCell>
                        <TableCell>{item.pagePath || '-'}</TableCell>
                        <TableCell>
                          {item.city || item.country
                            ? `${item.city || '-'}, ${item.country || '-'}`
                            : '-'}
                        </TableCell>
                        <TableCell>{item.userId || '-'}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={item.isLoggedIn ? 'Logged In' : 'Guest'}
                            color={item.isLoggedIn ? 'success' : 'default'}
                            variant={item.isLoggedIn ? 'filled' : 'outlined'}
                          />
                        </TableCell>
                        <TableCell>
                          {dayjs(item.occurredAt).format('YYYY-MM-DD HH:mm:ss')}
                        </TableCell>
                        <TableCell align="right">
                          <Button
                            size="small"
                            variant="text"
                            onClick={() => setSelectedEvent(item)}
                            data-track-click="analytics_open_event_detail"
                          >
                            详情
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 6 }}>
                        暂无数据
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </Scrollbar>
        )}

        <TablePagination
          component="div"
          count={eventsTotal}
          page={page}
          onPageChange={(_, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          rowsPerPageOptions={[5, 10, 20, 50]}
          labelRowsPerPage={isMobile ? '每页' : 'Rows per page'}
          labelDisplayedRows={({ from, to, count }) =>
            `${from}-${to} / ${count !== -1 ? count : `>${to}`}`
          }
          onRowsPerPageChange={(event) => {
            setRowsPerPage(parseInt(event.target.value, 10));
            setPage(0);
          }}
          sx={{
            '.MuiTablePagination-toolbar': {
              minHeight: 56,
              px: { xs: 1.5, sm: 2 },
              flexWrap: { xs: 'wrap', sm: 'nowrap' },
              rowGap: { xs: 1, sm: 0 },
            },
            '.MuiTablePagination-spacer': {
              display: { xs: 'none', sm: 'block' },
            },
          }}
        />
      </Card>

      <Dialog
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        fullScreen={isMobile}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          <Stack
            direction={{ xs: 'column', sm: 'row' }}
            alignItems={{ xs: 'stretch', sm: 'center' }}
            justifyContent="space-between"
            spacing={1.5}
          >
            <Typography variant="h6">事件详情</Typography>
            {selectedEvent ? (
              <Button
                size="small"
                variant="outlined"
                onClick={() =>
                  void handleCopy(
                    'copy_full_event',
                    '整条事件',
                    buildFullEventPayload(selectedEvent)
                  )
                }
                data-track-click="analytics_copy_full_event"
                sx={{ width: { xs: '100%', sm: 'auto' } }}
              >
                {copiedAction === 'copy_full_event' ? '已复制' : '复制整条事件'}
              </Button>
            ) : null}
          </Stack>
        </DialogTitle>
        <DialogContent dividers>
          {selectedEvent ? (
            <Stack spacing={2}>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <Typography variant="body2" color="text.secondary">
                  类型: {formatEventTypeName(selectedEvent.eventType)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  名称: {selectedEvent.eventName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  时间: {dayjs(selectedEvent.occurredAt).format('YYYY-MM-DD HH:mm:ss')}
                </Typography>
              </Stack>

              <Typography variant="body2">页面: {selectedEvent.pagePath || '-'}</Typography>
              <Typography variant="body2">IP: {selectedEvent.ip || '-'}</Typography>
              <Typography variant="body2">
                地区:{' '}
                {selectedEvent.city || selectedEvent.country
                  ? `${selectedEvent.city || '-'}, ${selectedEvent.country || '-'}`
                  : '-'}
              </Typography>
              <Typography variant="body2">用户ID: {selectedEvent.userId || '-'}</Typography>

              <Box>
                <Accordion disableGutters>
                  <AccordionSummary
                    expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={16} />}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'stretch', sm: 'center' }}
                      spacing={1}
                      sx={{ width: '100%' }}
                    >
                      <Typography variant="subtitle2">Basic Info</Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleCopy(
                            'copy_basic_info',
                            'Basic Info',
                            buildBasicInfo(selectedEvent)
                          );
                        }}
                        data-track-click="analytics_copy_basic_info"
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                      >
                        {copiedAction === 'copy_basic_info' ? '已复制' : '复制 JSON'}
                      </Button>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      component="pre"
                      sx={{
                        m: 0,
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        overflowX: 'auto',
                        maxHeight: { xs: 220, sm: 320 },
                        fontSize: { xs: 11, sm: 12 },
                        lineHeight: 1.5,
                      }}
                    >
                      {JSON.stringify(buildBasicInfo(selectedEvent), null, 2)}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>

              <Box>
                <Accordion disableGutters defaultExpanded>
                  <AccordionSummary
                    expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={16} />}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'stretch', sm: 'center' }}
                      spacing={1}
                      sx={{ width: '100%' }}
                    >
                      <Typography variant="subtitle2">UserInfo</Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleCopy(
                            'copy_user_info',
                            'UserInfo',
                            parseJSON(selectedEvent.userInfo) || {}
                          );
                        }}
                        data-track-click="analytics_copy_user_info"
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                      >
                        {copiedAction === 'copy_user_info' ? '已复制' : '复制 JSON'}
                      </Button>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      component="pre"
                      sx={{
                        m: 0,
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        overflowX: 'auto',
                        maxHeight: { xs: 220, sm: 320 },
                        fontSize: { xs: 11, sm: 12 },
                        lineHeight: 1.5,
                      }}
                    >
                      {JSON.stringify(parseJSON(selectedEvent.userInfo) || {}, null, 2)}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>

              <Box>
                <Accordion disableGutters>
                  <AccordionSummary
                    expandIcon={<Iconify icon="eva:arrow-ios-downward-fill" width={16} />}
                  >
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      justifyContent="space-between"
                      alignItems={{ xs: 'stretch', sm: 'center' }}
                      spacing={1}
                      sx={{ width: '100%' }}
                    >
                      <Typography variant="subtitle2">Meta</Typography>
                      <Button
                        size="small"
                        variant="text"
                        onClick={(e) => {
                          e.stopPropagation();
                          void handleCopy('copy_meta', 'Meta', parseJSON(selectedEvent.meta) || {});
                        }}
                        data-track-click="analytics_copy_meta"
                        sx={{ width: { xs: '100%', sm: 'auto' } }}
                      >
                        {copiedAction === 'copy_meta' ? '已复制' : '复制 JSON'}
                      </Button>
                    </Stack>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Box
                      component="pre"
                      sx={{
                        m: 0,
                        p: 2,
                        borderRadius: 1,
                        bgcolor: 'grey.100',
                        overflowX: 'auto',
                        maxHeight: { xs: 220, sm: 320 },
                        fontSize: { xs: 11, sm: 12 },
                        lineHeight: 1.5,
                      }}
                    >
                      {JSON.stringify(parseJSON(selectedEvent.meta) || {}, null, 2)}
                    </Box>
                  </AccordionDetails>
                </Accordion>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSelectedEvent(null)}>关闭</Button>
        </DialogActions>
      </Dialog>
    </DashboardContent>
  );
}
