import useSWR from 'swr';

import Box from '@mui/material/Box';
import Card from '@mui/material/Card';
import Grid from '@mui/material/Grid';
import Typography from '@mui/material/Typography';
import CardContent from '@mui/material/CardContent';

import { paths } from 'src/routes/paths';
import { RouterLink } from 'src/routes/components';

import { getAdminBlogs, getUsersList, getFileList } from 'src/http';
import { DashboardContent } from 'src/layouts/dashboard';

import { Iconify } from 'src/components/Iconify';

// ----------------------------------------------------------------------

const metadata = { title: 'Admin Dashboard' };

function StatCard({
  title,
  total,
  icon,
  color,
  href,
}: {
  title: string;
  total: number;
  icon: React.ComponentProps<typeof Iconify>['icon'];
  color: string;
  href: string;
}) {
  return (
    <Card
      component={RouterLink}
      href={href}
      sx={{ textDecoration: 'none', '&:hover': { boxShadow: (theme) => theme.shadows[10] } }}
    >
      <CardContent
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          p: 3,
        }}
      >
        <Box>
          <Typography variant="subtitle2" sx={{ color: 'text.secondary', mb: 1 }}>
            {title}
          </Typography>
          <Typography variant="h3">{total}</Typography>
        </Box>
        <Box
          sx={{
            width: 64,
            height: 64,
            display: 'flex',
            borderRadius: '50%',
            alignItems: 'center',
            justifyContent: 'center',
            bgcolor: `${color}`,
            color: 'common.white',
          }}
        >
          <Iconify icon={icon} width={36} />
        </Box>
      </CardContent>
    </Card>
  );
}

export default function Page() {
  const swrOptions = {
    revalidateIfStale: false,
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
  };
  const { data: blogsData } = useSWR(
    ['adminBlogs', { page: 1, pageSize: 1 }],
    () => getAdminBlogs({ page: 1, pageSize: 1 }),
    swrOptions
  );
  const { data: usersData } = useSWR(
    ['adminUsers', { page: 1, pageSize: 1 }],
    () => getUsersList({ page: 1, pageSize: 1 }),
    swrOptions
  );
  const { data: uploadsData } = useSWR(
    ['adminUploads', { page: 1, pageSize: 1 }],
    () => getFileList({ page: 1, pageSize: 1 }),
    swrOptions
  );
  const blogsTotal = blogsData?.total ?? 0;
  const usersTotal = usersData?.total ?? 0;
  const uploadsTotal = uploadsData?.total ?? 0;

  return (
    <>
      <title>{metadata.title}</title>
      <meta name="description" content="Admin dashboard overview" />

      <DashboardContent>
        <Typography variant="h4" sx={{ mb: 5 }}>
          Welcome back 👋
        </Typography>

        <Grid container spacing={3}>
          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Total Blogs"
              total={blogsTotal}
              icon="solar:file-bold-duotone"
              color="primary.main"
              href={paths.admin.blog.root}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Total Users"
              total={usersTotal}
              icon="solar:users-group-rounded-bold-duotone"
              color="info.main"
              href={paths.admin.user.root}
            />
          </Grid>

          <Grid size={{ xs: 12, sm: 6, md: 4 }}>
            <StatCard
              title="Total Files"
              total={uploadsTotal}
              icon="solar:add-folder-bold"
              color="warning.main"
              href={paths.admin.fileManager}
            />
          </Grid>
        </Grid>
      </DashboardContent>
    </>
  );
}
