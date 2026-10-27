import { Heart, SearchLg, ShoppingBag01, User01 } from '@untitledui/icons'
import { AnimatePresence, motion } from 'motion/react'
import { Link, NavLink } from 'react-router'
import { Logo } from '@/components/Logo/Logo'
import { selectItemCount, useCartStore } from '@/features/cart/cartStore'
import { useCategories } from '@/features/catalog/hooks'
import { routePaths } from '@/Routes/routePaths'
import { cx } from '@/utils/cx'
import { MobileNav } from './MobileNav'
import { PromoBanner } from './PromoBanner'
import { useChromeHeight } from './useChromeHeight'

const navLinkClass = ({ isActive }: { isActive: boolean }) =>
  cx(
    'relative py-2 text-sm font-medium transition-colors after:absolute after:inset-x-0 after:-bottom-px after:h-px after:origin-left after:bg-current after:transition-transform after:duration-300',
    isActive ? 'text-beige after:scale-x-100' : 'text-neutral-300 after:scale-x-0 hover:text-white hover:after:scale-x-100',
  )

export function Header() {
  const { data: categories = [] } = useCategories()
  const cartCount = useCartStore(selectItemCount)
  const headerRef = useChromeHeight()

  return (
    <header ref={headerRef} className="sticky top-0 z-40">
      <PromoBanner />
      <div className="border-b border-white/10 bg-neutral-950/95">
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
            <HeaderIconLink to={routePaths.cart} label={cartCount > 0 ? `Cart, ${cartCount} items` : 'Cart'} icon={ShoppingBag01}>
              <AnimatePresence>
                {cartCount > 0 && (
                  <motion.span
                    key={cartCount}
                    aria-hidden
                    initial={{ scale: 0.4, opacity: 0 }}
                    animate={{ scale: [1.35, 1], opacity: 1 }}
                    exit={{ scale: 0.4, opacity: 0 }}
                    transition={{ type: 'spring', stiffness: 520, damping: 18 }}
                    className="absolute top-1 right-0.5 flex min-w-4.5 items-center justify-center rounded-full bg-beige px-1 text-[0.65rem] leading-4.5 font-semibold text-neutral-950 tabular-nums"
                  >
                    {cartCount}
                  </motion.span>
                )}
              </AnimatePresence>
            </HeaderIconLink>
          </div>
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

function HeaderIconLink({ to, label, icon: Icon, className, children }: HeaderIconLinkProps) {
  return (
    <Link
      to={to}
      aria-label={label}
      className={cx(
        'relative inline-flex size-10 items-center justify-center rounded-full text-neutral-300 transition-colors hover:bg-white/10 hover:text-white',
        className,
      )}
    >
      <Icon className="size-5" aria-hidden />
      {children}
    </Link>
  )
}
