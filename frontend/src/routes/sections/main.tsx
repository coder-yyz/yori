import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { MainLayout } from 'src/layouts/main';

import { SplashScreen } from 'src/components/LoadingScreen';

// ----------------------------------------------------------------------

// Blog
const BlogHome = lazy(() => import('src/pages/Blog/List'));

const BlogTimeline = lazy(() => import('src/pages/Blog/Timeline'));
const BlogDetail = lazy(() => import('src/pages/Blog/Details'));

// Error
const Page500 = lazy(() => import('src/pages/Error500'));
const Page403 = lazy(() => import('src/pages/Error403'));
const Page404 = lazy(() => import('src/pages/Error404'));
// Blank
const BlankPage = lazy(() => import('src/pages/Blank'));

// ----------------------------------------------------------------------
const AboutPage = lazy(() => import('src/pages/AboutMe'));
const ComingSoonPage = lazy(() => import('src/pages/ComingSoon'));
const PhotoWallPage = lazy(() => import('src/pages/PhotoWall'));
// ----------------------------------------------------------------------

export const mainRoutes: RouteObject[] = [
  {
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [
      {
        element: (
          <MainLayout>
            <Outlet />
          </MainLayout>
        ),
        children: [
          { path: 'about-us', element: <AboutPage /> },
          { path: 'blank', element: <BlankPage /> },
          { path: 'coming-soon', element: <ComingSoonPage /> },
          { path: 'photo-wall', element: <PhotoWallPage /> },
          {
            path: 'blog',
            children: [
              { index: true, element: <BlogHome /> },
              { path: 'list', element: <BlogHome /> },
              { path: 'timeline', element: <BlogTimeline /> },
              { path: ':id', element: <BlogDetail /> },
            ],
          },
        ],
      },
      {
        path: 'error',
        children: [
          { path: '500', element: <Page500 /> },
          { path: '404', element: <Page404 /> },
          { path: '403', element: <Page403 /> },
        ],
      },
    ],
  },
];
