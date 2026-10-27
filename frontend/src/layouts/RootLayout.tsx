import { RouterProvider as AriaRouterProvider } from 'react-aria-components'
import { Outlet, ScrollRestoration, useHref, useNavigate, type NavigateOptions } from 'react-router'

declare module 'react-aria-components' {
  interface RouterConfig {
    routerOptions: NavigateOptions
  }
}

export function RootLayout() {
  const navigate = useNavigate()
  return (
    <AriaRouterProvider navigate={(to, options) => void navigate(to, options)} useHref={useHref}>
      <Outlet />
      <ScrollRestoration />
    </AriaRouterProvider>
  )
}
