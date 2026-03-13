import {
  createBrowserRouter,
  createRoutesFromElements,
  Route,
  RouterProvider,
} from 'react-router-dom';
import './i18n';
import { lazy, Suspense } from 'react';

import { ToastContainer } from 'react-toastify';
import { GlobalProvider } from './context/GlobalProvider';
import SiteLoading from './layout/SiteLoading';
import RootLayout from './layout/RootLayout';
const SiteRouter = lazy(() => import('./router/SiteRouter'));
const AdminRouter = lazy(() => import('./router/AdminRouter'));
const Login = lazy(() => import('./Admin/Auth/Login'));

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<RootLayout />}>
      <Route
        path="/admin/login"
        element={
          <Suspense fallback={<SiteLoading />}>
            <Login />
          </Suspense>
        }
      />
      <Route
        path="/admin/*"
        element={
          <Suspense fallback={<SiteLoading />}>
            <AdminRouter />
          </Suspense>
        }
      />
      <Route
        path="/*"
        element={
          <Suspense fallback={<SiteLoading />}>
            <SiteRouter />
          </Suspense>
        }
      />
    </Route>
  )
);

const App = () => {
  return (
    <GlobalProvider>
      <ToastContainer />
      <div className="overflow-x-hidden">
        <RouterProvider router={router} />
      </div>
    </GlobalProvider>
  );
};

export default App;
