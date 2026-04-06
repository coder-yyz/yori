import type { BlogItem } from 'src/types/blog';

import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';

import { paths } from 'src/routes/paths';

import { BlogItemSkeleton } from 'src/components/Blog/BlogSkeleton';

import { BlogItemCard, BlogItemLatest } from '../../../components/BlogItemCard';

// ----------------------------------------------------------------------

type Props = {
  blogs: BlogItem[];
  loading?: boolean;
};

export function BlogList({ blogs, loading }: Props) {
  const renderLoading = () => (
    <Box
      sx={{
        gap: 3,
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(2, 1fr)', md: 'repeat(4, 1fr)' },
      }}
    >
      <BlogItemSkeleton />
    </Box>
  );

  const renderList = () => (
    <Grid container spacing={3}>
      {blogs.slice(0, 3).map((blog, index) => (
        <Grid
          key={blog.id}
          sx={{ display: { xs: 'none', lg: 'block' } }}
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: index === 0 ? 6 : 3,
          }}
        >
          <BlogItemLatest blog={blog} index={index} detailsHref={paths.blog.details(blog.id)} />
        </Grid>
      ))}

      {blogs.slice(0, 3).map((blog) => (
        <Grid
          key={blog.id}
          sx={{ display: { lg: 'none' } }}
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
          }}
        >
          <BlogItemCard blog={blog} detailsHref={paths.blog.details(blog.id)} />
        </Grid>
      ))}

      {blogs.slice(3, blogs.length).map((blog) => (
        <Grid
          key={blog.id}
          size={{
            xs: 12,
            sm: 6,
            md: 4,
            lg: 3,
          }}
        >
          <BlogItemCard blog={blog} detailsHref={paths.blog.details(blog.id)} />
        </Grid>
      ))}
    </Grid>
  );

  return <>{loading ? renderLoading() : renderList()}</>;
}
