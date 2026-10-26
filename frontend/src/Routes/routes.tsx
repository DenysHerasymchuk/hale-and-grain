import { createBrowserRouter, type RouteObject } from 'react-router'
import { RootLayout } from '@/layouts/RootLayout'
import { StoreLayout } from '@/layouts/StoreLayout'
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage'
import { RouteErrorPage } from '@/pages/RouteError/RouteErrorPage'

// Every page is code-split; `lazy` resolves the named export each page module provides.
const page = <M,>(load: () => Promise<M>, pick: (module: M) => React.ComponentType) => async () => ({ Component: pick(await load()) })

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        element: <StoreLayout />,
        children: [
          {
            errorElement: <RouteErrorPage />,
            children: [
              { index: true, lazy: page(() => import('@/pages/Landing/LandingPage'), (m) => m.LandingPage) },
              { path: 'products', lazy: page(() => import('@/pages/Products/ProductsPage'), (m) => m.ProductsPage) },
              { path: 'categories/:slug', lazy: page(() => import('@/pages/Category/CategoryPage'), (m) => m.CategoryPage) },
              { path: 'search', lazy: page(() => import('@/pages/Search/SearchPage'), (m) => m.SearchPage) },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
