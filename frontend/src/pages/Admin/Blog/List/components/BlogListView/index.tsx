import type { BlogItem } from 'src/types/blog';

import { orderBy } from 'es-toolkit';
import { useState, useCallback } from 'react';

import Box from '@mui/material/Box';
import Tab from '@mui/material/Tab';
import Tabs from '@mui/material/Tabs';
import Button from '@mui/material/Button';
import Pagination from '@mui/material/Pagination';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { DashboardContent } from 'src/layouts/dashboard';

const BLOG_SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'oldest', label: 'Oldest' },
];
import { useGetMyBlogs, useGetAdminBlogs } from 'src/actions/blog';

import { Label } from 'src/components/Label';
import { Iconify } from 'src/components/Iconify';
import { BlogSort } from 'src/components/Blog/BlogSort';
import { BlogSearch } from 'src/components/Blog/BlogSearch';
import { CustomBreadcrumbs } from 'src/components/CustomBreadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

import { BlogListHorizontal } from '../BlogListHorizontal';

const PUBLISH_OPTIONS = ['all', 'published', 'draft'] as const;

const PAGE_SIZE = 10;

export function BlogListView() {
  const [sortBy, setSortBy] = useState('latest');
  const [publish, setPublish] = useState<string>('all');
  const [page, setPage] = useState(1);

  const { user } = useAuthContext();
  const isAdmin = user?.role === 'root' || user?.role === 'admin';

  const queryParams = {
    page,
    pageSize: PAGE_SIZE,
    ...(publish !== 'all' ? { status: publish } : {}),
  };

  const adminResult = useGetAdminBlogs(isAdmin ? queryParams : null);
  const myResult = useGetMyBlogs(!isAdmin ? queryParams : null);

  const { blogs, blogsTotal, blogsLoading } = isAdmin ? adminResult : myResult;

  const pageCount = Math.max(1, Math.ceil(blogsTotal / PAGE_SIZE));

  const dataFiltered = applyFilter({ inputData: blogs, sortBy });

  const handleFilterPublish = useCallback((_event: React.SyntheticEvent, newValue: string) => {
    setPublish(newValue);
    setPage(1);
  }, []);

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="博客列表"
        links={[
          { name: 'Dashboard', href: paths.admin.home },
          { name: 'Blog', href: paths.admin.blog.root },
          { name: 'List' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.admin.blog.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            新建博客
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Box
        sx={{
          gap: 3,
          display: 'flex',
          mb: { xs: 3, md: 5 },
          justifyContent: 'space-between',
          flexDirection: { xs: 'column', sm: 'row' },
          alignItems: { xs: 'flex-end', sm: 'center' },
        }}
      >
        <BlogSearch redirectPath={(id: string) => paths.admin.blog.details(id)} />

        <BlogSort
          sort={sortBy}
          onSort={(newValue: string) => setSortBy(newValue)}
          sortOptions={BLOG_SORT_OPTIONS}
        />
      </Box>

      <Tabs value={publish} onChange={handleFilterPublish} sx={{ mb: { xs: 3, md: 5 } }}>
        {PUBLISH_OPTIONS.map((tab) => (
          <Tab
            key={tab}
            iconPosition="end"
            value={tab}
            label={tab}
            icon={
              <Label
                variant={((tab === 'all' || tab === publish) && 'filled') || 'soft'}
                color={(tab === 'published' && 'info') || 'default'}
              >
                {tab === 'all' && blogsTotal}
                {tab === 'published' && (publish === 'published' ? blogsTotal : '-')}
                {tab === 'draft' && (publish === 'draft' ? blogsTotal : '-')}
              </Label>
            }
            sx={{ textTransform: 'capitalize' }}
          />
        ))}
      </Tabs>

      <BlogListHorizontal blogs={dataFiltered} loading={blogsLoading} />

      {pageCount > 1 && (
        <Pagination
          count={pageCount}
          page={page}
          onChange={(_, p) => setPage(p)}
          sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 5, md: 8 } }}
        />
      )}
    </DashboardContent>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: BlogItem[];
  sortBy: string;
};

function applyFilter({ inputData, sortBy }: ApplyFilterProps) {
  if (sortBy === 'latest') {
    inputData = orderBy(inputData, ['createdAt'], ['desc']);
  }

  if (sortBy === 'oldest') {
    inputData = orderBy(inputData, ['createdAt'], ['asc']);
  }

  if (sortBy === 'popular') {
    inputData = orderBy(inputData, ['totalViews'], ['desc']);
  }

  return inputData;
}
