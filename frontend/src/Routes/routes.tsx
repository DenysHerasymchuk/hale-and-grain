import { createBrowserRouter, type RouteObject } from 'react-router'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ProfileLayout } from '@/layouts/ProfileLayout'
import { RootLayout } from '@/layouts/RootLayout'
import { StoreLayout } from '@/layouts/StoreLayout'
import { NotFoundPage } from '@/pages/NotFoundPage'
import { RouteErrorPage } from '@/pages/RouteErrorPage'
import { AdminRoute } from './AdminRoute'
import { ProtectedRoute } from './ProtectedRoute'

const page = <M,>(load: () => Promise<M>, pick: (module: M) => React.ComponentType) => async () => ({ Component: pick(await load()) })

export const routes: RouteObject[] = [
  {
    element: <RootLayout />,
    errorElement: <RouteErrorPage />,
    children: [
      {
        path: 'admin',
        element: <AdminRoute />,
        errorElement: <RouteErrorPage />,
        children: [
          {
            element: <AdminLayout />,
            children: [
              { index: true, lazy: page(() => import('@/pages/Admin/Dashboard/DashboardPage'), (m) => m.DashboardPage) },
              { path: 'products', lazy: page(() => import('@/pages/Admin/ProductsPage'), (m) => m.AdminProductsPage) },
              { path: 'products/new', lazy: page(() => import('@/pages/Admin/ProductEditor/ProductEditorPage'), (m) => m.ProductEditorPage) },
              { path: 'products/:id/edit', lazy: page(() => import('@/pages/Admin/ProductEditor/ProductEditorPage'), (m) => m.ProductEditorPage) },
              { path: 'categories', lazy: page(() => import('@/pages/Admin/CategoriesPage'), (m) => m.CategoriesPage) },
              { path: 'inventory', lazy: page(() => import('@/pages/Admin/InventoryPage'), (m) => m.InventoryPage) },
              { path: 'orders', lazy: page(() => import('@/pages/Admin/OrdersPage'), (m) => m.AdminOrdersPage) },
              { path: 'orders/:id', lazy: page(() => import('@/pages/Admin/AdminOrderDetailsPage'), (m) => m.AdminOrderDetailsPage) },
              { path: 'customers', lazy: page(() => import('@/pages/Admin/CustomersPage'), (m) => m.CustomersPage) },
              { path: 'settings', lazy: page(() => import('@/pages/Admin/SettingsPage'), (m) => m.AdminSettingsPage) },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
      {
        element: <AuthLayout />,
        errorElement: <RouteErrorPage />,
        children: [
          { path: 'login', lazy: page(() => import('@/pages/LoginPage'), (m) => m.LoginPage) },
          { path: 'register', lazy: page(() => import('@/pages/RegisterPage'), (m) => m.RegisterPage) },
          { path: 'forgot-password', lazy: page(() => import('@/pages/ForgotPasswordPage'), (m) => m.ForgotPasswordPage) },
          { path: 'reset-password', lazy: page(() => import('@/pages/ResetPasswordPage'), (m) => m.ResetPasswordPage) },
        ],
      },
      {
        element: <StoreLayout />,
        children: [
          {
            errorElement: <RouteErrorPage />,
            children: [
              { index: true, lazy: page(() => import('@/pages/Landing/LandingPage'), (m) => m.LandingPage) },
              { path: 'products', lazy: page(() => import('@/pages/ProductsPage'), (m) => m.ProductsPage) },
              { path: 'products/:slug', lazy: page(() => import('@/pages/ProductDetails/ProductDetailsPage'), (m) => m.ProductDetailsPage) },
              { path: 'categories/:slug', lazy: page(() => import('@/pages/CategoryPage'), (m) => m.CategoryPage) },
              { path: 'wishlist', lazy: page(() => import('@/pages/WishlistPage'), (m) => () => <m.WishlistPage />) },
              { path: 'cart', lazy: page(() => import('@/pages/Cart/CartPage'), (m) => m.CartPage) },
              { path: 'checkout', lazy: page(() => import('@/pages/Checkout/CheckoutPage'), (m) => m.CheckoutPage) },
              { path: 'checkout/payment', lazy: page(() => import('@/pages/CheckoutPaymentPage'), (m) => m.CheckoutPaymentPage) },
              {
                path: 'checkout/confirmation/:orderNumber',
                lazy: page(() => import('@/pages/CheckoutConfirmationPage'), (m) => m.CheckoutConfirmationPage),
              },
              { path: 'orders/:orderNumber', lazy: page(() => import('@/pages/OrderPage'), (m) => m.OrderPage) },
              { path: 'search', lazy: page(() => import('@/pages/SearchPage'), (m) => m.SearchPage) },
              {
                element: <ProtectedRoute />,
                children: [
                  {
                    path: 'profile',
                    element: <ProfileLayout />,
                    children: [
                      { index: true, lazy: page(() => import('@/pages/Profile/ProfilePage'), (m) => m.ProfilePage) },
                      {
                        path: 'personal-information',
                        lazy: page(() => import('@/pages/Profile/PersonalInformationPage'), (m) => m.PersonalInformationPage),
                      },
                      { path: 'addresses', lazy: page(() => import('@/pages/Profile/Addresses/AddressesPage'), (m) => m.AddressesPage) },
                      { path: 'orders', lazy: page(() => import('@/pages/Profile/ProfileOrdersPage'), (m) => m.ProfileOrdersPage) },
                      {
                        path: 'orders/:orderNumber',
                        lazy: page(() => import('@/pages/Profile/ProfileOrderDetailsPage'), (m) => m.ProfileOrderDetailsPage),
                      },
                      { path: 'wishlist', lazy: page(() => import('@/pages/WishlistPage'), (m) => () => <m.WishlistPage embedded />) },
                      { path: 'settings', lazy: page(() => import('@/pages/Profile/ProfileSettingsPage'), (m) => m.ProfileSettingsPage) },
                    ],
                  },
                ],
              },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
    ],
  },
]

export const router = createBrowserRouter(routes)
