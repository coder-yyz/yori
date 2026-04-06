import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/CustomBreadcrumbs';

import { BlogCreateEditForm } from '../../../components/BlogCreateEditForm';

// ----------------------------------------------------------------------

export function BlogCreateView() {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Create a new blog"
        links={[
          { name: 'Dashboard', href: paths.admin.home },
          { name: 'Blog', href: paths.admin.blog.root },
          { name: 'Create' },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <BlogCreateEditForm />
    </DashboardContent>
  );
}
