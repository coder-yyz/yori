import type { BlogItemModel } from 'src/models';

import { useState, useEffect, useCallback } from 'react';

import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Stack from '@mui/material/Stack';
import Button from '@mui/material/Button';
import Container from '@mui/material/Container';
import Typography from '@mui/material/Typography';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { updateBlog } from 'src/http';
import { DashboardContent } from 'src/layouts/dashboard';

import { toast } from 'src/components/Snackbar';
import { Iconify } from 'src/components/Iconify';
import { Markdown } from 'src/components/Markdown';
import { EmptyContent } from 'src/components/EmptyContent';
import { BlogDetailsHero } from 'src/components/Blog/BlogDetailsHero';
import { BlogDetailsSkeleton } from 'src/components/Blog/BlogSkeleton';

import { BlogDetailsToolbar } from '../BlogDetailsToolbar';

type Props = {
  blog?: BlogItemModel;
  loading?: boolean;
  error?: any;
};

const BLOG_PUBLISH_OPTIONS = [
  { value: 'published', label: 'Published' },
  { value: 'draft', label: 'Draft' },
];
export function BlogDetailsView({ blog, loading, error }: Props) {
  const [publish, setPublish] = useState('draft');

  const handleChangePublish = useCallback(
    async (newValue: string) => {
      if (!blog) return;
      try {
        await updateBlog(blog.id, { status: newValue });
        setPublish(newValue);
        toast.success(newValue === 'published' ? '已发布' : '已转为草稿');
      } catch (err) {
        console.error(err);
        toast.error('状态更新失败');
      }
    },
    [blog]
  );

  useEffect(() => {
    if (blog) {
      setPublish(blog.status || 'draft');
    }
  }, [blog]);

  if (loading) {
    return (
      <DashboardContent maxWidth={false} disablePadding>
        <BlogDetailsSkeleton />
      </DashboardContent>
    );
  }

  if (error) {
    return (
      <DashboardContent maxWidth={false}>
        <EmptyContent
          filled
          title="Blog not found!"
          action={
            <Button
              component={RouterLink}
              href={paths.admin.blog.root}
              startIcon={<Iconify width={16} icon="eva:arrow-ios-back-fill" />}
              sx={{ mt: 3 }}
            >
              Back to list
            </Button>
          }
          sx={{ py: 10, height: 'auto', flexGrow: 'unset' }}
        />
      </DashboardContent>
    );
  }

  return (
    <DashboardContent maxWidth={false} disablePadding>
      <Container maxWidth={false} sx={{ px: { sm: 5 } }}>
        <BlogDetailsToolbar
          backHref={paths.admin.blog.root}
          editHref={paths.admin.blog.edit(`${blog?.id}`)}
          liveHref={paths.admin.blog.details(`${blog?.id}`)}
          publish={publish}
          onChangePublish={handleChangePublish}
          publishOptions={BLOG_PUBLISH_OPTIONS}
        />
      </Container>

      <BlogDetailsHero title={`${blog?.title}`} coverUrl={`${blog?.coverUrl}`} />

      <Box
        sx={{
          pb: 5,
          mx: 'auto',
          maxWidth: 720,
          mt: { xs: 5, md: 10 },
          px: { xs: 2, sm: 3 },
        }}
      >
        <Typography variant="subtitle1">{blog?.description}</Typography>

        <Markdown
          contentType={blog?.contentType as 'html' | 'markdown' | undefined}
          children={blog?.content}
        />

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
      </Box>
    </DashboardContent>
  );
}
