import type { BlogItem } from 'src/types/blog';

import { useState } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Grid from '@mui/material/Grid';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Divider from '@mui/material/Divider';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useGetComments } from 'src/actions/blog';

import { Iconify } from 'src/components/Iconify';
import { Markdown } from 'src/components/Markdown';
import { EmptyContent } from 'src/components/EmptyContent';
import { CustomBreadcrumbs } from 'src/components/CustomBreadcrumbs';
import { BlogDetailsHero } from 'src/components/Blog/BlogDetailsHero';
import { BlogDetailsSkeleton } from 'src/components/Blog/BlogSkeleton';

import { BlogCommentList } from '../BlogCommentList';
import { BlogCommentForm } from '../BlogCommentForm';
import { BlogItemCard } from '../../../components/BlogItemCard';

// ----------------------------------------------------------------------

type Props = {
  blog?: BlogItem;
  latestBlogs?: BlogItem[];
  loading?: boolean;
  error?: any;
};

export function BlogDetailsHomeView({ blog, latestBlogs, loading, error }: Props) {
  const [commentPage, setCommentPage] = useState(1);

  const { comments, commentsTotal } = useGetComments(blog?.id || '', {
    page: commentPage,
    pageSize: 10,
  });

  if (loading) {
    return <BlogDetailsSkeleton />;
  }

  if (error) {
    return (
      <Container sx={{ mt: 5, mb: 10 }}>
        <EmptyContent
          filled
          title="Blog not found!"
          action={
            <Button
              component={RouterLink}
              href={paths.blog.root}
              startIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
              sx={{ mt: 3 }}
            >
              Back to list
            </Button>
          }
          sx={{ py: 10 }}
        />
      </Container>
    );
  }

  return (
    <>
      <BlogDetailsHero
        title={blog?.title ?? ''}
        author={blog?.author}
        coverUrl={blog?.coverUrl ?? ''}
        createdAt={blog?.createdAt}
      />

      <Container
        maxWidth={false}
        sx={[
          (theme) => ({ py: 3, mb: 5, borderBottom: `solid 1px ${theme.vars.palette.divider}` }),
        ]}
      >
        <CustomBreadcrumbs
          links={[
            { name: 'Home', href: '/' },
            { name: 'Blog', href: paths.blog.root },
            { name: blog?.title },
          ]}
          sx={{ maxWidth: 720, mx: 'auto' }}
        />
      </Container>

      <Container maxWidth={false}>
        <Stack sx={{ maxWidth: 720, mx: 'auto' }}>
          <Typography variant="subtitle1">{blog?.description}</Typography>

          <Markdown contentType={blog?.contentType} children={blog?.content} />

          <Stack
            spacing={3}
            sx={[
              (theme) => ({
                py: 3,
                borderTop: `dashed 1px ${theme.vars.palette.divider}`,
                borderBottom: `dashed 1px ${theme.vars.palette.divider}`,
              }),
            ]}
          >
            <Box sx={{ gap: 1, display: 'flex', flexWrap: 'wrap' }}>
              {blog?.tags.map((tag) => (
                <Chip key={tag.id} label={tag.name} variant="soft" />
              ))}
            </Box>
          </Stack>

          <Box sx={{ mb: 3, mt: 5, display: 'flex', gap: 0.5 }}>
            <Typography variant="h4">Comments</Typography>

            <Typography variant="subtitle2" sx={{ color: 'text.disabled' }}>
              ({commentsTotal})
            </Typography>
          </Box>

          {blog?.id && <BlogCommentForm blogId={blog.id} />}

          <Divider sx={{ mt: 5, mb: 2 }} />

          {blog?.id && (
            <BlogCommentList
              blogId={blog.id}
              comments={comments}
              total={commentsTotal}
              page={commentPage}
              onPageChange={setCommentPage}
            />
          )}
        </Stack>
      </Container>

      {!!latestBlogs?.length && (
        <Container sx={{ pb: 15 }}>
          <Typography variant="h4" sx={{ mb: 5 }}>
            Recent Blogs
          </Typography>

          <Grid container spacing={3}>
            {latestBlogs?.slice(latestBlogs.length - 4).map((latestBlog) => (
              <Grid
                key={latestBlog.id}
                size={{
                  xs: 12,
                  sm: 6,
                  md: 4,
                  lg: 3,
                }}
              >
                <BlogItemCard blog={latestBlog} detailsHref={paths.blog.details(latestBlog.id)} />
              </Grid>
            ))}
          </Grid>
        </Container>
      )}
    </>
  );
}
