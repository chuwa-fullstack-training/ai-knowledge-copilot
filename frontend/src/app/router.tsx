import { lazy, Suspense } from 'react';
import { createBrowserRouter, Navigate } from 'react-router-dom';
import { PrivateRoute } from '../components/auth/PrivateRoute';
import { Layout } from '../components/layout/Layout';

// Lazy load pages for code splitting
const LoginPage = lazy(() => import('../pages/auth/LoginPage'));
const RegisterPage = lazy(() => import('../pages/auth/RegisterPage'));
const DashboardPage = lazy(() => import('../pages/dashboard/DashboardPage'));
const WorkspacePage = lazy(() => import('../pages/workspace/WorkspacePage'));
const ProfilePage = lazy(() => import('../pages/profile/ProfilePage'));

// Loading component
const LoadingFallback = () => (
  <div className="flex h-screen items-center justify-center">
    <div className="text-lg">Loading...</div>
  </div>
);

// Wrap lazy loaded components with Suspense
const withSuspense = (Component: React.ComponentType) => (
  <Suspense fallback={<LoadingFallback />}>
    <Component />
  </Suspense>
);

// Router configuration
export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/dashboard" replace />,
  },
  {
    path: '/login',
    element: withSuspense(LoginPage),
  },
  {
    path: '/register',
    element: withSuspense(RegisterPage),
  },
  {
    path: '/dashboard',
    element: (
      <PrivateRoute>
        <Layout>{withSuspense(DashboardPage)}</Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/workspace',
    element: (
      <PrivateRoute>
        <Layout>{withSuspense(WorkspacePage)}</Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '/profile',
    element: (
      <PrivateRoute>
        <Layout>{withSuspense(ProfilePage)}</Layout>
      </PrivateRoute>
    ),
  },
  {
    path: '*',
    element: <Navigate to="/dashboard" replace />,
  },
]);
