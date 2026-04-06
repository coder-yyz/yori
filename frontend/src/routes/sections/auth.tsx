import type { RouteObject } from 'react-router';

import { Outlet } from 'react-router';
import { lazy, Suspense } from 'react';

import { AuthSplitLayout } from 'src/layouts/auth-split';

import { SplashScreen } from 'src/components/LoadingScreen';

import { GuestGuard } from 'src/auth/guard';

const Jwt = {
  SignInPage: lazy(() => import('src/pages/Auth/SignIn')),
  SignUpPage: lazy(() => import('src/pages/Auth/SignUp')),
};

export const authRoutes: RouteObject[] = [
  {
    path: 'auth',
    element: (
      <Suspense fallback={<SplashScreen />}>
        <Outlet />
      </Suspense>
    ),
    children: [
      {
        path: 'sign-in',
        element: (
          <GuestGuard>
            <AuthSplitLayout
              slotProps={{
                section: { title: 'Hi, Welcome back' },
              }}
            >
              <Jwt.SignInPage />
            </AuthSplitLayout>
          </GuestGuard>
        ),
      },
      {
        path: 'sign-up',
        element: (
          <GuestGuard>
            <AuthSplitLayout>
              <Jwt.SignUpPage />
            </AuthSplitLayout>
          </GuestGuard>
        ),
      },
    ],
  },
];
