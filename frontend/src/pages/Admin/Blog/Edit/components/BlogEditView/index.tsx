import type { BlogItemModel } from 'src/models';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/CustomBreadcrumbs';

import { BlogCreateEditForm } from '../../../components/BlogCreateEditForm';

// ----------------------------------------------------------------------

type Props = {
  blog?: BlogItemModel;
};

export function BlogEditView({ blog }: Props) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.admin.blog.root}
        links={[
          { name: 'Dashboard', href: paths.admin.home },
          { name: 'Blog', href: paths.admin.blog.root },
          { name: blog?.title },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <BlogCreateEditForm currentBlog={blog} />
    </DashboardContent>
  );
}
