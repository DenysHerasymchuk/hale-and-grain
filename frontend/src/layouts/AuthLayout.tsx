import { Outlet } from 'react-router'
import { Logo } from '@/components/Logo/Logo'

/** Focused shell for sign-in flows: no store navigation to wander off into. */
export function AuthLayout() {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="flex flex-col px-6 py-8 sm:px-12">
        <Logo />
        <main className="mx-auto flex w-full max-w-sm flex-1 flex-col justify-center py-12">
          <Outlet />
        </main>
      </div>
      <div className="relative hidden bg-secondary lg:block">
        <img src="/images/products/atelier-drawer-cabinet-1.webp" alt="" className="absolute inset-0 size-full object-cover" />
      </div>
    </div>
  )
}
