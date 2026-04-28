import type { RouteObject } from 'react-router';

import { lazy, Suspense } from 'react';

import { MainLayout } from 'src/layouts/main';
import { SplashScreen } from 'src/components/LoadingScreen';

import { authRoutes } from './auth';
import { mainRoutes } from './main';
import { adminRoutes } from './admin';

// ----------------------------------------------------------------------

const HomePage = lazy(() => import('src/pages/Blog/List'));
const Page404 = lazy(() => import('src/pages/Error404'));

export const routesSection: RouteObject[] = [
  {
    path: '/',
    element: (
      <Suspense fallback={<SplashScreen />}>
        <MainLayout>
          <HomePage />
        </MainLayout>
      </Suspense>
    ),
  },

  // Auth
  ...authRoutes,

  // Main
  ...mainRoutes,

  // Admin
  ...adminRoutes,

  // No match
  { path: '*', element: <Page404 /> },
];
