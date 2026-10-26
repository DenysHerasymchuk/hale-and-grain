import { Link } from 'react-router'
import { Logo } from '@/components/Logo/Logo'
import { useCategories } from '@/features/catalog/hooks'
import { routePaths } from '@/Routes/routePaths'

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
          <Logo inverted />
          <p className="mt-5 text-sm leading-relaxed text-neutral-400">
            Solid-timber furniture, designed in our studio and made to order in small batches. Built to be repaired, not replaced.
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
        <div className="container-page flex flex-col gap-2 py-6 text-xs text-neutral-500 sm:flex-row sm:justify-between">
          <p>&copy; {currentYear} Hale &amp; Grain. Prices in EUR, including VAT.</p>
          <p>
            3D models from{' '}
            <a href="https://polyhaven.com" className="underline underline-offset-2 hover:text-neutral-300" target="_blank" rel="noreferrer">
              Poly Haven
            </a>{' '}
            (CC0).
          </p>
        </div>
      </div>
    </footer>
  )
}
