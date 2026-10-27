import { NavLink, useNavigate } from 'react-router'
import { PageTransition } from '@/components/Motion/PageTransition'
import { useLogout, useSession } from '@/features/auth/useSession'
import { routePaths } from '@/Routes/routePaths'
import { cx } from '@/utils/cx'

const links = [
  { to: routePaths.profile, label: 'Overview', end: true },
  { to: routePaths.profilePersonal, label: 'Personal information' },
  { to: routePaths.profileAddresses, label: 'Addresses' },
  { to: routePaths.profileOrders, label: 'Orders' },
  { to: routePaths.profileWishlist, label: 'Wishlist' },
  { to: routePaths.profileSettings, label: 'Settings' },
]

export function ProfileLayout() {
  const navigate = useNavigate()
  const { data: session } = useSession()
  const logout = useLogout()

  return (
    <div className="container-page py-12 md:py-16">
      <p className="eyebrow">Your account</p>
      <p className="mt-2 font-display text-3xl text-primary">{session?.firstName ? `Hello, ${session.firstName}` : session?.email}</p>

      <div className="mt-10 grid gap-10 lg:grid-cols-[14rem_1fr]">
        <nav aria-label="Account" className="lg:sticky lg:top-32 lg:self-start">
          <ul className="flex gap-1 overflow-x-auto pb-2 lg:flex-col lg:overflow-visible lg:pb-0">
            {links.map((link) => (
              <li key={link.to} className="shrink-0">
                <NavLink
                  to={link.to}
                  end={link.end}
                  className={({ isActive }) =>
                    cx('block rounded-md px-3 py-2 text-sm whitespace-nowrap transition-colors', isActive ? 'bg-secondary font-medium text-primary' : 'text-tertiary hover:text-primary')
                  }
                >
                  {link.label}
                </NavLink>
              </li>
            ))}
            {session?.isAdmin && (
              <li className="shrink-0">
                <NavLink to={routePaths.admin} className="block rounded-md px-3 py-2 text-sm whitespace-nowrap text-brand-700 hover:underline">
                  Store admin
                </NavLink>
              </li>
            )}
            <li className="shrink-0 lg:mt-4 lg:border-t lg:border-secondary lg:pt-4">
              <button
                type="button"
                onClick={() => logout.mutate(undefined, { onSettled: () => void navigate(routePaths.home) })}
                className="block w-full rounded-md px-3 py-2 text-left text-sm whitespace-nowrap text-tertiary hover:text-primary"
              >
                Sign out
              </button>
            </li>
          </ul>
        </nav>
        <section className="min-w-0">
          <PageTransition />
        </section>
      </div>
    </div>
  )
}
