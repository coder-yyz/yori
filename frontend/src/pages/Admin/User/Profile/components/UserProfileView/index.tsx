import Card from '@mui/material/Card';

import { paths } from 'src/routes/paths';

import { DashboardContent } from 'src/layouts/dashboard';

import { CustomBreadcrumbs } from 'src/components/CustomBreadcrumbs';

import { useAuthContext } from 'src/auth/hooks';

import { ProfileHome } from '../ProfileHome';
import { ProfileCover } from '../ProfileCover';

// ----------------------------------------------------------------------

export function UserProfileView() {
  const { user } = useAuthContext();

  const userInfo = {
    id: user?.id ?? '',
    role: user?.role ?? '',
    quote: user?.about ?? '',
    email: user?.email ?? '',
    school: '',
    country: user?.country ?? '',
    company: '',
    totalFollowers: 0,
    totalFollowing: 0,
    socialLinks: {
      facebook: '',
      instagram: '',
      linkedin: '',
      twitter: '',
    },
  };

  return (
    <DashboardContent>
      <CustomBreadcrumbs
        heading="Profile"
        links={[
          { name: 'Dashboard', href: paths.admin.home },
          { name: 'User', href: paths.admin.user.root },
          { name: user?.displayName },
        ]}
        sx={{ mb: { xs: 3, md: 5 } }}
      />

      <Card sx={{ height: 290 }}>
        <ProfileCover
          role={user?.role ?? ''}
          name={user?.displayName}
          avatarUrl={user?.photoURL}
          coverUrl=""
        />
      </Card>

      <ProfileHome info={userInfo} blogs={[]} sx={{ mt: 3 }} />
    </DashboardContent>
  );
}
