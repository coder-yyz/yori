import type { IUserItem } from 'src/types/user';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/CustomBreadcrumbs';

import { UserCreateEditForm } from '../../../components/UserCreateEditForm';

// ----------------------------------------------------------------------

type Props = {
  user?: IUserItem | Record<string, any> | null;
};

export function UserEditView({ user: currentUser }: Props) {
  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Edit"
        backHref={paths.admin.user.list}
        links={[
          { name: 'Dashboard', href: paths.admin.home },
          { name: 'User', href: paths.admin.user.root },
          { name: currentUser?.displayName || currentUser?.username },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <UserCreateEditForm currentUser={currentUser as IUserItem} />
    </DashboardContent>
  );
}
