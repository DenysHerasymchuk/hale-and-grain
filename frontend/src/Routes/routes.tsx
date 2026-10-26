import { createBrowserRouter, type RouteObject } from 'react-router'
import { RootLayout } from '@/layouts/RootLayout'
import { StoreLayout } from '@/layouts/StoreLayout'
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage'
import { RouteErrorPage } from '@/pages/RouteError/RouteErrorPage'

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <StoreLayout />,
        children: [
          { errorElement: <RouteErrorPage />, children: [{ path: '*', element: <NotFoundPage /> }] },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
