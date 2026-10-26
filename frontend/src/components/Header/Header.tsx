import { Heart, SearchLg, ShoppingBag01, User01 } from '@untitledui/icons'
import { Link, NavLink } from 'react-router'
import { Logo } from '@/components/Logo/Logo'
import { useCategories } from '@/features/catalog/hooks'
import { routePaths } from '@/Routes/routePaths'
import { cx } from '@/utils/cx'
import { MobileNav } from './MobileNav'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cx(
    'relative py-2 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:bg-current after:transition-transform after:duration-300',
    isActive ? 'text-primary after:scale-x-100' : 'text-secondary after:scale-x-0 hover:text-primary hover:after:scale-x-100',
  )

export function Header() {
  const { data: categories = [] } = useCategories()

  return (
    <header className="sticky top-0 z-40 border-b border-secondary bg-primary/90 backdrop-blur-md">
      <div className="bg-neutral-900 text-neutral-100">
        <p className="container-page py-2 text-center text-xs tracking-wide">
          Free delivery on orders over €750 &middot; Made to order in small batches
        </p>
      </div>

      <div className="container-page flex h-18 items-center gap-6">
        <MobileNav categories={categories} />

        <Logo className="shrink-0" />

        <nav aria-label="Main" className="mx-auto hidden lg:block">
          <ul className="flex items-center gap-8">
            <li>
              <NavLink to={routePaths.products} end className={navLinkClass}>
                Shop all
              </NavLink>
            </li>
            {categories.map((category) => (
              <li key={category.id}>
                <NavLink to={routePaths.category(category.slug)} className={navLinkClass}>
                  {category.name}
                </NavLink>
              </li>
            ))}
            <li>
              <NavLink to={routePaths.about} className={navLinkClass}>
                Studio
              </NavLink>
            </li>
          </ul>
        </nav>

        <div className="ml-auto flex items-center gap-1 lg:ml-0">
          <HeaderIconLink to={routePaths.search} label="Search" icon={SearchLg} />
          <HeaderIconLink to={routePaths.wishlist} label="Wishlist" icon={Heart} className="hidden sm:inline-flex" />
          <HeaderIconLink to={routePaths.profile} label="Account" icon={User01} className="hidden sm:inline-flex" />
          <HeaderIconLink to={routePaths.cart} label="Cart" icon={ShoppingBag01} />
        </div>
      </div>
    </header>
  )
}

interface HeaderIconLinkProps {
  to: string
  label: string
  icon: typeof Heart
  className?: string
  children?: React.ReactNode
}

export function HeaderIconLink({ to, label, icon: Icon, className, children }: HeaderIconLinkProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cx('relative inline-flex size-10 items-center justify-center rounded-full text-secondary transition-colors hover:bg-secondary hover:text-primary', className)}
    >
      <Icon className="size-5" aria-hidden />
      {children}
    </Link>
  )
}
