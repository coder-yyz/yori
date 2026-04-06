import Button from '@mui/material/Button';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { useGetAdminUsers } from 'src/actions/user';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/Iconify';
import { CustomBreadcrumbs } from 'src/components/CustomBreadcrumbs';

import { UserCardList } from '../UserCardList';

// ----------------------------------------------------------------------

export function UserCardsView() {
  const { users, usersLoading } = useGetAdminUsers();

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Cards"
        links={[
          { name: 'Dashboard', href: paths.admin.home },
          { name: 'User', href: paths.admin.user.root },
          { name: 'Cards' },
        ]}
        action={
          <Button
            component={RouterLink}
            href={paths.admin.user.new}
            variant="contained"
            startIcon={<Iconify icon="mingcute:add-line" />}
          >
            Add user
          </Button>
        }
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <UserCardList users={users} loading={usersLoading} />
    </DashboardContent>
  );
}
