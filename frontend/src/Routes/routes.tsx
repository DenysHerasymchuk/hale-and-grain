import { createBrowserRouter, type RouteObject } from 'react-router'
import { AdminLayout } from '@/layouts/AdminLayout'
import { AuthLayout } from '@/layouts/AuthLayout'
import { ProfileLayout } from '@/layouts/ProfileLayout'
import { RootLayout } from '@/layouts/RootLayout'
import { StoreLayout } from '@/layouts/StoreLayout'
import { NotFoundPage } from '@/pages/NotFound/NotFoundPage'
import { RouteErrorPage } from '@/pages/RouteError/RouteErrorPage'
import { AdminRoute } from './AdminRoute'
import { ProtectedRoute } from './ProtectedRoute'

// Every page is code-split; `lazy` resolves the named export each page module provides.
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
              { path: 'products', lazy: page(() => import('@/pages/Admin/Products/ProductsPage'), (m) => m.AdminProductsPage) },
              { path: 'products/new', lazy: page(() => import('@/pages/Admin/ProductEditor/ProductEditorPage'), (m) => m.ProductEditorPage) },
              { path: 'products/:id/edit', lazy: page(() => import('@/pages/Admin/ProductEditor/ProductEditorPage'), (m) => m.ProductEditorPage) },
              { path: 'categories', lazy: page(() => import('@/pages/Admin/Categories/CategoriesPage'), (m) => m.CategoriesPage) },
              { path: 'inventory', lazy: page(() => import('@/pages/Admin/Inventory/InventoryPage'), (m) => m.InventoryPage) },
              { path: 'orders', lazy: page(() => import('@/pages/Admin/Orders/OrdersPage'), (m) => m.AdminOrdersPage) },
              { path: 'orders/:id', lazy: page(() => import('@/pages/Admin/OrderDetails/AdminOrderDetailsPage'), (m) => m.AdminOrderDetailsPage) },
              { path: 'customers', lazy: page(() => import('@/pages/Admin/Customers/CustomersPage'), (m) => m.CustomersPage) },
              { path: 'settings', lazy: page(() => import('@/pages/Admin/Settings/SettingsPage'), (m) => m.AdminSettingsPage) },
              { path: '*', element: <NotFoundPage /> },
            ],
          },
        ],
      },
      {
        element: <AuthLayout />,
        errorElement: <RouteErrorPage />,
        children: [
          { path: 'login', lazy: page(() => import('@/pages/Login/LoginPage'), (m) => m.LoginPage) },
          { path: 'register', lazy: page(() => import('@/pages/Register/RegisterPage'), (m) => m.RegisterPage) },
          { path: 'forgot-password', lazy: page(() => import('@/pages/ForgotPassword/ForgotPasswordPage'), (m) => m.ForgotPasswordPage) },
          { path: 'reset-password', lazy: page(() => import('@/pages/ResetPassword/ResetPasswordPage'), (m) => m.ResetPasswordPage) },
        ],
      },
      {
        element: <StoreLayout />,
        children: [
          {
            errorElement: <RouteErrorPage />,
            children: [
              { index: true, lazy: page(() => import('@/pages/Landing/LandingPage'), (m) => m.LandingPage) },
              { path: 'products', lazy: page(() => import('@/pages/Products/ProductsPage'), (m) => m.ProductsPage) },
              { path: 'products/:slug', lazy: page(() => import('@/pages/ProductDetails/ProductDetailsPage'), (m) => m.ProductDetailsPage) },
              { path: 'categories/:slug', lazy: page(() => import('@/pages/Category/CategoryPage'), (m) => m.CategoryPage) },
              { path: 'wishlist', lazy: page(() => import('@/pages/Wishlist/WishlistPage'), (m) => () => <m.WishlistPage />) },
              { path: 'cart', lazy: page(() => import('@/pages/Cart/CartPage'), (m) => m.CartPage) },
              { path: 'checkout', lazy: page(() => import('@/pages/Checkout/CheckoutPage'), (m) => m.CheckoutPage) },
              { path: 'checkout/payment', lazy: page(() => import('@/pages/CheckoutPayment/CheckoutPaymentPage'), (m) => m.CheckoutPaymentPage) },
              {
                path: 'checkout/confirmation/:orderNumber',
                lazy: page(() => import('@/pages/CheckoutConfirmation/CheckoutConfirmationPage'), (m) => m.CheckoutConfirmationPage),
              },
              { path: 'orders/:orderNumber', lazy: page(() => import('@/pages/Order/OrderPage'), (m) => m.OrderPage) },
              { path: 'search', lazy: page(() => import('@/pages/Search/SearchPage'), (m) => m.SearchPage) },
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
                        lazy: page(() => import('@/pages/Profile/PersonalInformation/PersonalInformationPage'), (m) => m.PersonalInformationPage),
                      },
                      { path: 'addresses', lazy: page(() => import('@/pages/Profile/Addresses/AddressesPage'), (m) => m.AddressesPage) },
                      { path: 'orders', lazy: page(() => import('@/pages/Profile/Orders/ProfileOrdersPage'), (m) => m.ProfileOrdersPage) },
                      {
                        path: 'orders/:orderNumber',
                        lazy: page(() => import('@/pages/Profile/OrderDetails/ProfileOrderDetailsPage'), (m) => m.ProfileOrderDetailsPage),
                      },
                      { path: 'wishlist', lazy: page(() => import('@/pages/Wishlist/WishlistPage'), (m) => () => <m.WishlistPage embedded />) },
                      { path: 'settings', lazy: page(() => import('@/pages/Profile/Settings/ProfileSettingsPage'), (m) => m.ProfileSettingsPage) },
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
