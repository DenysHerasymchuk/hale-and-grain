import { Link } from 'react-router'
import { Logo } from '@/components/Logo/Logo'
import { useCategories } from '@/features/catalog/hooks'
import { routePaths } from '@/Routes/routePaths'
import { PaymentMethods } from './PaymentMethods'

const currentYear = new Date().getFullYear()

export function Footer() {
  const { data: categories = [] } = useCategories()

  const columns = [
    {
      title: 'Shop',
      links: [{ label: 'All furniture', to: routePaths.products }, ...categories.map((c) => ({ label: c.name, to: routePaths.category(c.slug) }))],
    },
    {
      title: 'Help',
      links: [
        { label: 'Contact the studio', to: routePaths.contact },
        { label: 'Delivery & returns', to: `${routePaths.about}#delivery` },
        { label: 'Your orders', to: routePaths.profileOrders },
        { label: 'Wishlist', to: routePaths.wishlist },
      ],
    },
    {
      title: 'Studio',
      links: [
        { label: 'Our story', to: routePaths.about },
        { label: 'Materials & care', to: `${routePaths.about}#care` },
        { label: 'Account', to: routePaths.profile },
      ],
    },
  ]

  return (
    <footer className="mt-24 bg-neutral-900 text-neutral-300">
      <div className="container-page grid gap-12 py-16 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div className="max-w-xs">
          <Logo />
          <p className="mt-5 text-sm leading-relaxed text-neutral-400">
            Solid-timber furniture, designed in our studio and made to order in small batches. Every joint can be taken apart for repair.
          </p>
        </div>
        {columns.map((column) => (
          <nav key={column.title} aria-label={column.title}>
            <h2 className="text-xs font-semibold tracking-[0.14em] text-neutral-500 uppercase">{column.title}</h2>
            <ul className="mt-4 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-neutral-300 transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}
      </div>
      <div className="border-t border-neutral-800">
        <div className="container-page grid items-center gap-6 py-7 text-xs text-neutral-500 lg:grid-cols-[1fr_auto_1fr]">
          <div className="space-y-1.5">
            <p className="text-neutral-300">Copyright {currentYear} &copy; Hale &amp; Grain. Prices in EUR, including VAT.</p>
            <p className="max-w-sm leading-relaxed">
              Product photos are studio renders of the 3D models, shown without props. Models from{' '}
              <a href="https://polyhaven.com" className="underline underline-offset-2 hover:text-neutral-300" target="_blank" rel="noreferrer">
                Poly Haven
              </a>{' '}
              (CC0).
            </p>
          </div>

          <PaymentMethods />

          <div className="flex flex-wrap items-center gap-x-5 gap-y-2 lg:justify-end">
            {['Privacy Policy', 'Terms of Service', 'Return & Refund Policy'].map((label) => (
              <span key={label} className="text-neutral-300 underline underline-offset-4">
                {label}
              </span>
            ))}
            <span className="italic">(it&rsquo;s just a demo, man)</span>
          </div>
        </div>
      </div>
    </footer>
  )
}
