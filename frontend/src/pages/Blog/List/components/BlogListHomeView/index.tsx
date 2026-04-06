import type { BlogItem } from 'src/types/blog';

import { useState } from 'react';
import { orderBy } from 'es-toolkit';

import Box from '@mui/material/Box';
import Container from '@mui/material/Container';
import Pagination from '@mui/material/Pagination';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';

import { useGetBlogs } from 'src/actions/blog';

const BLOG_SORT_OPTIONS = [
  { value: 'latest', label: 'Latest' },
  { value: 'popular', label: 'Popular' },
  { value: 'oldest', label: 'Oldest' },
];

import { BlogSort } from 'src/components/Blog/BlogSort';
import { EmptyContent } from 'src/components/EmptyContent';
import { BlogSearch } from 'src/components/Blog/BlogSearch';

import { BlogList } from '../BlogList';

// ----------------------------------------------------------------------

const PAGE_SIZE = 12;

export function BlogListHomeView() {
  const [sortBy, setSortBy] = useState('latest');
  const [page, setPage] = useState(1);

  const { blogs, blogsTotal, blogsLoading } = useGetBlogs({ page, pageSize: PAGE_SIZE });

  const dataFiltered = applyFilter({ inputData: blogs, sortBy });

  const pageCount = Math.max(1, Math.ceil(blogsTotal / PAGE_SIZE));

  const renderNoData = () => <EmptyContent filled sx={{ py: 10 }} />;

  const isEmpty = !blogsLoading && !blogs.length;

  return (
    <Container sx={{ mb: 10 }}>
      <Typography variant="h4" sx={[{ mb: 3, mt: { xs: 1, md: 3 } }]}>
        Blog
      </Typography>

      <Box
        sx={[
          {
            gap: 3,
            display: 'flex',
            mb: { xs: 3, md: 5 },
            justifyContent: 'space-between',
            flexDirection: { xs: 'column', sm: 'row' },
            alignItems: { xs: 'flex-end', sm: 'center' },
          },
        ]}
      >
        <BlogSearch redirectPath={(id: string) => paths.blog.details(id)} />

        <BlogSort
          sort={sortBy}
          onSort={(newValue: string) => setSortBy(newValue)}
          sortOptions={BLOG_SORT_OPTIONS}
        />
      </Box>

      {isEmpty ? renderNoData() : <BlogList blogs={dataFiltered} loading={blogsLoading} />}

      {pageCount > 1 && (
        <Pagination
          count={pageCount}
          page={page}
          onChange={(_, p) => setPage(p)}
          sx={{ display: 'flex', justifyContent: 'center', mt: { xs: 5, md: 8 } }}
        />
      )}
    </Container>
  );
}

// ----------------------------------------------------------------------

type ApplyFilterProps = {
  inputData: BlogItem[];
  sortBy: string;
};

function applyFilter({ inputData, sortBy }: ApplyFilterProps) {
  if (sortBy === 'latest') {
    return orderBy(inputData, ['createdAt'], ['desc']);
  }

  if (sortBy === 'oldest') {
    return orderBy(inputData, ['createdAt'], ['asc']);
  }

  if (sortBy === 'popular') {
    return orderBy(inputData, ['totalViews'], ['desc']);
  }

  return inputData;
}
