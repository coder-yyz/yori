import 'reflect-metadata';

import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { Outlet, RouterProvider, createBrowserRouter } from 'react-router';

import { setEnv } from 'src/models';

import App from './App';
import { routesSection } from './routes/sections';
import { ErrorBoundary } from './routes/components';

// 初始化 transform-model 环境（自动读取 import.meta.env.MODE）
setEnv(
  (import.meta.env.MODE === 'production'
    ? 'production'
    : import.meta.env.MODE === 'test'
      ? 'test'
      : 'development') as any
);

// ----------------------------------------------------------------------

const router = createBrowserRouter([
  {
    Component: () => (
      <App>
        <Outlet />
      </App>
    ),
    errorElement: <ErrorBoundary />,
    children: routesSection,
  },
]);

const root = createRoot(document.getElementById('root')!);

root.render(
  <StrictMode>
    <RouterProvider router={router} />
  </StrictMode>
);
