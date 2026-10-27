import { BarChartSquare02, Box, Users01, Package, Settings01, Tag01, ShoppingBag01, ArrowLeft } from '@untitledui/icons'
import { NavLink, Outlet, useNavigate } from 'react-router'
import { Logo } from '@/components/Logo/Logo'
import { useLogout, useSession } from '@/features/auth/useSession'
import { routePaths } from '@/Routes/routePaths'
import { cx } from '@/utils/cx'

const links = [
  { to: routePaths.admin, label: 'Dashboard', icon: BarChartSquare02, end: true },
  { to: routePaths.adminProducts, label: 'Products', icon: Box },
  { to: routePaths.adminCategories, label: 'Categories', icon: Tag01 },
  { to: routePaths.adminInventory, label: 'Inventory', icon: Package },
  { to: routePaths.adminOrders, label: 'Orders', icon: ShoppingBag01 },
  { to: routePaths.adminCustomers, label: 'Customers', icon: Users01 },
  { to: routePaths.adminSettings, label: 'Settings', icon: Settings01 },
]

export function AdminLayout() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const logout = useLogout()

  return (
    <div className="grid min-h-dvh bg-secondary lg:grid-cols-[15rem_1fr]">
      <aside className="flex flex-col bg-neutral-950 text-neutral-300 lg:sticky lg:top-0 lg:h-dvh">
        <div className="flex items-center justify-between px-5 py-5">
          <Logo className="origin-left scale-90" />
          <span className="rounded-full bg-white/10 px-2 py-0.5 text-[0.65rem] font-semibold tracking-wider text-beige uppercase">Admin</span>
        </div>
        <nav aria-label="Admin" className="flex-1 px-3">
          <ul className="flex gap-1 overflow-x-auto pb-3 lg:flex-col lg:overflow-visible">
            {links.map(({ to, label, icon: Icon, end }) => (
              <li key={to} className="shrink-0">
                <NavLink
                  to={to}
                  end={end}
                  className={({ isActive }) =>
                    cx('flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors', isActive ? 'bg-white/10 font-medium text-white' : 'hover:bg-white/5 hover:text-white')
                  }
                >
                  <Icon className="size-4" aria-hidden />
                  {label}
                </NavLink>
              </li>
            ))}
          </ul>
        </nav>
        <div className="hidden border-t border-white/10 p-4 text-xs lg:block">
          <p className="truncate text-neutral-400">{session?.email}</p>
          <div className="mt-3 flex justify-between">
            <NavLink to={routePaths.home} className="inline-flex items-center gap-1 hover:text-white">
              <ArrowLeft className="size-3.5" aria-hidden /> Store
            </NavLink>
            <button type="button" className="hover:text-white" onClick={() => logout.mutate(undefined, { onSettled: () => void navigate(routePaths.home) })}>
              Sign out
            </button>
          </div>
        </div>
      </aside>
      <main id="main" className="min-w-0 p-5 md:p-8 lg:p-10">
        <Outlet />
      </main>
    </div>
  )
}
