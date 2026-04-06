import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { DashboardLayout } from 'src/layouts/dashboard';

import { LoadingScreen } from 'src/components/LoadingScreen';
import { AccountLayout } from 'src/components/AccountLayout';

import { useAuthContext } from 'src/auth/hooks';
import { AuthGuard, RoleBasedGuard } from 'src/auth/guard';

import { usePathname } from '../hooks';

// ----------------------------------------------------------------------
// Home
const HomePage = lazy(() => import('src/pages/Admin/Home'));
// User
const UserProfilePage = lazy(() => import('src/pages/Admin/User/Profile'));
const UserCardsPage = lazy(() => import('src/pages/Admin/User/Cards'));
const UserListPage = lazy(() => import('src/pages/Admin/User/List'));
const UserCreatePage = lazy(() => import('src/pages/Admin/User/New'));
const UserEditPage = lazy(() => import('src/pages/Admin/User/Edit'));
// Account
const AccountGeneralPage = lazy(() => import('src/pages/Admin/User/Account/General'));
const AccountSocialsPage = lazy(() => import('src/pages/Admin/User/Account/Socials'));
const AccountChangePasswordPage = lazy(() => import('src/pages/Admin/User/Account/ChangePassword'));
// Blog
const BlogListPage = lazy(() => import('src/pages/Admin/Blog/List'));
const BlogDetailsPage = lazy(() => import('src/pages/Admin/Blog/Details'));
const BlogNewPage = lazy(() => import('src/pages/Admin/Blog/New'));
const BlogEditPage = lazy(() => import('src/pages/Admin/Blog/Edit'));
const BlogTagsPage = lazy(() => import('src/pages/Admin/Blog/Tags'));
const BlogCategoriesPage = lazy(() => import('src/pages/Admin/Blog/Categories'));
// File manager
const FileManagerPage = lazy(() => import('src/pages/Admin/FileManager'));

// ----------------------------------------------------------------------

function SuspenseOutlet() {
  const pathname = usePathname();
  return (
    <Suspense key={pathname} fallback={<LoadingScreen />}>
      <Outlet />
    </Suspense>
  );
}

const dashboardLayout = () => (
  <DashboardLayout>
    <SuspenseOutlet />
  </DashboardLayout>
);

const accountLayout = () => (
  <AccountLayout>
    <SuspenseOutlet />
  </AccountLayout>
);

function AdminOnly({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  return (
    <RoleBasedGuard currentRole={user?.role || ''} allowedRoles={['root', 'admin']} hasContent>
      {children}
    </RoleBasedGuard>
  );
}

function AdminUp({ children }: { children: React.ReactNode }) {
  const { user } = useAuthContext();
  return (
    <RoleBasedGuard currentRole={user?.role || ''} allowedRoles={['root', 'admin']} hasContent>
      {children}
    </RoleBasedGuard>
  );
}

export const adminRoutes: RouteObject[] = [
  {
    path: 'admin',
    element: <AuthGuard>{dashboardLayout()}</AuthGuard>,
    children: [
      { index: true, element: <HomePage /> },
      {
        path: 'user',
        children: [
          { index: true, element: <UserProfilePage /> },
          { path: 'profile', element: <UserProfilePage /> },
          {
            path: 'cards',
            element: (
              <AdminOnly>
                <UserCardsPage />
              </AdminOnly>
            ),
          },
          {
            path: 'list',
            element: (
              <AdminOnly>
                <UserListPage />
              </AdminOnly>
            ),
          },
          {
            path: 'new',
            element: (
              <AdminOnly>
                <UserCreatePage />
              </AdminOnly>
            ),
          },
          {
            path: ':id/edit',
            element: (
              <AdminOnly>
                <UserEditPage />
              </AdminOnly>
            ),
          },
          {
            path: 'account',
            element: accountLayout(),
            children: [
              { index: true, element: <AccountGeneralPage /> },
              { path: 'socials', element: <AccountSocialsPage /> },
              { path: 'change-password', element: <AccountChangePasswordPage /> },
            ],
          },
        ],
      },
      {
        path: 'blog',
        children: [
          { index: true, element: <BlogListPage /> },
          { path: 'list', element: <BlogListPage /> },
          {
            path: 'tags',
            element: (
              <AdminUp>
                <BlogTagsPage />
              </AdminUp>
            ),
          },
          {
            path: 'categories',
            element: (
              <AdminUp>
                <BlogCategoriesPage />
              </AdminUp>
            ),
          },
          { path: ':id', element: <BlogDetailsPage /> },
          { path: ':id/edit', element: <BlogEditPage /> },
          { path: 'new', element: <BlogNewPage /> },
        ],
      },
      {
        path: 'file-manager',
        element: (
          <AdminOnly>
            <FileManagerPage />
          </AdminOnly>
        ),
      },
    ],
  },
];
