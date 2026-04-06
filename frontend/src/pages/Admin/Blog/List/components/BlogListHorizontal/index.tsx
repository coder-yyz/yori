import type { BlogItem } from 'src/types/blog';

import Box from '@mui/material/Box';

import { paths } from 'src/routes/paths';

import { BlogItemSkeleton } from 'src/components/Blog/BlogSkeleton';

import { BlogItemHorizontal } from '../BlogItemHorizontal';

type Props = {
  blogs: BlogItem[];
  loading?: boolean;
};

export function BlogListHorizontal({ blogs, loading }: Props) {
  const renderLoading = () => <BlogItemSkeleton variant="horizontal" />;

  const renderList = () =>
    blogs.map((blog) => (
      <BlogItemHorizontal
        key={blog.id}
        blog={blog}
        detailsHref={paths.admin.blog.details(blog.id)}
        editHref={paths.admin.blog.edit(blog.id)}
      />
    ));

  return (
    <Box
      sx={{
        gap: 3,
        display: 'grid',
        gridTemplateColumns: { xs: 'repeat(1, 1fr)', md: 'repeat(2, 1fr)' },
      }}
    >
      {loading ? renderLoading() : renderList()}
    </Box>
  );
}
